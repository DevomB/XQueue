/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly POSTWAVE_IPC_PORT?: string;
  readonly VITE_POSTWAVE_IPC_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
