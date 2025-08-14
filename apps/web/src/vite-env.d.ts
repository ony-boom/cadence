/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SESSION_PASSPHRASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
