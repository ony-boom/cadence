import type { SessionData, SessionManager } from "@cadence/api/auth/session";
import { b64ToBuffer, bufferToB64 } from "./utils.ts";

type ManagerOptions = Partial<{
  dbName: string;
  storeName: string;
  metaStoreName: string;
  keyId: string;
  kdfIterations: number;
  kdfSaltBytes: number;
}>;

type EncryptedPayload = { iv: string; ct: string };
const SINGLETON_KEY = "singleton";

export class IndexDBSessionManager implements SessionManager {
  private cache: SessionData | null = null;
  private cryptoKey: CryptoKey | null = null;
  private readonly dbPromise: Promise<IDBDatabase>;
  private readonly opts: Required<ManagerOptions> & { passphrase: string };

  private constructor(opts: typeof this.opts) {
    this.opts = opts;
    this.dbPromise = this.openDb();
  }

  static async create(opts: ManagerOptions = {}) {
    const mgr = new IndexDBSessionManager({
      dbName: "subsonic-auth",
      storeName: "session",
      metaStoreName: "meta",
      keyId: "kdf_salt",
      kdfIterations: 100_000,
      kdfSaltBytes: 16,
      passphrase: import.meta.env.VITE_SESSION_PASSPHRASE,
      ...opts,
    });

    if (!mgr.opts.passphrase)
      throw new Error("VITE_SESSION_PASSPHRASE is required");

    await mgr.ensureCryptoKey();
    mgr.cache = (await mgr.readSession()) ?? null;
    return mgr;
  }

  async save(session: SessionData) {
    this.cache = session;
    try {
      const key = await this.ensureCryptoKey();
      const payload = await this.encryptJson(JSON.stringify(session), key);
      await this.putRecord(this.opts.storeName, { id: SINGLETON_KEY, payload });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }

  load() {
    return this.cache;
  }

  async clear() {
    this.cache = null;
    try {
      await this.deleteRecord(this.opts.storeName, SINGLETON_KEY);
    } catch (err) {
      console.error("Failed to clear session:", err);
    }
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.opts.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        [this.opts.storeName, this.opts.metaStoreName].forEach((name) => {
          if (!db.objectStoreNames.contains(name))
            db.createObjectStore(name, { keyPath: "id" });
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async readSession(): Promise<SessionData | null> {
    const record = await this.getRecord<{ payload: EncryptedPayload }>(
      this.opts.storeName,
      SINGLETON_KEY,
    );
    if (!record?.payload) return null;

    const json = await this.decryptJson(
      record.payload,
      await this.ensureCryptoKey(),
    );
    return JSON.parse(json) as SessionData;
  }

  private async ensureCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    const salt = await this.getOrCreateSalt();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.opts.passphrase),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    this.cryptoKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: this.opts.kdfIterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    return this.cryptoKey;
  }

  private async getOrCreateSalt(): Promise<ArrayBuffer> {
    const meta = await this.getRecord<{ salt: string }>(
      this.opts.metaStoreName,
      this.opts.keyId,
    );
    if (meta?.salt) return b64ToBuffer(meta.salt);

    const salt = crypto.getRandomValues(new Uint8Array(this.opts.kdfSaltBytes));
    await this.putRecord(this.opts.metaStoreName, {
      id: this.opts.keyId,
      salt: bufferToB64(salt.buffer),
    });
    return salt.buffer;
  }

  private async encryptJson(
    plaintext: string,
    key: CryptoKey,
  ): Promise<EncryptedPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    );
    return { iv: bufferToB64(iv.buffer), ct: bufferToB64(ct) };
  }

  private async decryptJson(payload: EncryptedPayload, key: CryptoKey) {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(b64ToBuffer(payload.iv)) },
      key,
      b64ToBuffer(payload.ct),
    );
    return new TextDecoder().decode(pt);
  }

  private async getRecord<T>(
    storeName: string,
    key: IDBValidKey,
  ): Promise<T | null> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const result = await new Promise<T | null>((res, rej) => {
      const req = store.get(key);
      req.onsuccess = () => res((req.result as T) ?? null);
      req.onerror = () => rej(req.error);
    });

    await this.waitTx(tx);
    return result;
  }

  private async putRecord(storeName: string, value: unknown): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    await new Promise<void>((res, rej) => {
      const req = store.put(value);
      req.onsuccess = () => res();
      req.onerror = () =>
        rej(req.error ?? new DOMException("store.put failed"));
    });

    await this.waitTx(tx);
  }

  private async deleteRecord(
    storeName: string,
    key: IDBValidKey,
  ): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    await this.waitTx(tx);
  }

  private waitTx(tx: IDBTransaction): Promise<void> {
    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error ?? new DOMException("transaction error"));
      tx.onabort = () =>
        rej(tx.error ?? new DOMException("transaction aborted"));
    });
  }
}
