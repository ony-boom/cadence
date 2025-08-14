import type { SessionData, SessionManager } from "@cadence/api/auth/session";
import { b64ToBuffer, bufferToB64 } from "./utils.ts";

type ManagerOptions = Partial<{
  dbName: string;
  storeName: string;
  metaStoreName: string;
  keyId: string;
  passphrase: string;
  kdfIterations: number;
  kdfSaltBytes: number;
}>;

type EncryptedPayload = { iv: string; ct: string };
const SINGLETON_KEY = "singleton";
type InternalOptions = Required<Omit<ManagerOptions, "passphrase">> &
  Pick<ManagerOptions, "passphrase">;

export class IndexDBSessionManager implements SessionManager {
  private cache: SessionData | null = null;
  private cryptoKey: CryptoKey | null = null;
  private readonly dbPromise: Promise<IDBDatabase>;
  private readonly opts: InternalOptions;

  private constructor(opts: InternalOptions) {
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
      ...opts,
    });
    if (mgr.opts.passphrase) await mgr.ensureCryptoKey();
    mgr.cache = (await mgr.readSession()) ?? null;
    return mgr;
  }

  save(session: SessionData) {
    this.cache = session;
    void this.persistSession(session).catch(() => {});
  }

  load() {
    return this.cache;
  }

  clear() {
    this.cache = null;
    void this.deleteSession().catch(() => {});
  }

  // --- IndexedDB helpers ---
  private openDb() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.opts.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const name of [this.opts.storeName, this.opts.metaStoreName]) {
          if (!db.objectStoreNames.contains(name))
            db.createObjectStore(name, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async tx(storeName: string, mode: IDBTransactionMode) {
    const db = await this.dbPromise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  private idbOp<T>(
    req: IDBRequest<T>,
    resolve: (v: T) => void,
    reject: (e: DOMException | null) => void,
  ) {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }

  // --- Session I/O ---
  private async readSession(): Promise<SessionData | null> {
    const store = await this.tx(this.opts.storeName, "readonly");
    const record = await new Promise<{
      payload?: EncryptedPayload;
      data?: SessionData;
    } | null>((res, rej) => this.idbOp(store.get(SINGLETON_KEY), res, rej));
    if (!record) return null;

    try {
      if (this.opts.passphrase && record.payload) {
        const json = await this.decryptJson(
          record.payload,
          await this.ensureCryptoKey(),
        );
        return JSON.parse(json) as SessionData;
      }
      return record.data ?? null;
    } catch {
      return null;
    }
  }

  private async persistSession(session: SessionData) {
    const store = await this.tx(this.opts.storeName, "readwrite");
    const value = this.opts.passphrase
      ? {
          id: SINGLETON_KEY,
          payload: await this.encryptJson(
            JSON.stringify(session),
            await this.ensureCryptoKey(),
          ),
        }
      : { id: SINGLETON_KEY, data: session };
    await new Promise<IDBValidKey>((res, rej) =>
      this.idbOp(store.put(value), res, rej),
    );
  }

  private async deleteSession() {
    const store = await this.tx(this.opts.storeName, "readwrite");
    await new Promise<void>((res, rej) =>
      this.idbOp(store.delete(SINGLETON_KEY), res, rej),
    );
  }

  // --- Crypto ---
  private async ensureCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;
    if (!this.opts.passphrase) throw new Error("Passphrase not provided");

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
    const store = await this.tx(this.opts.metaStoreName, "readwrite");
    const meta = await new Promise<{ salt: string } | null>((res, rej) =>
      this.idbOp(store.get(this.opts.keyId), res, rej),
    );
    if (!meta) {
      const salt = crypto.getRandomValues(
        new Uint8Array(this.opts.kdfSaltBytes),
      );
      await new Promise<IDBValidKey>((res, rej) =>
        this.idbOp(
          store.put({ id: this.opts.keyId, salt: bufferToB64(salt.buffer) }),
          res,
          rej,
        ),
      );
      return salt.buffer;
    }
    return b64ToBuffer(meta.salt);
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
}
