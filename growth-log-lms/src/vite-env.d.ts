/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 1 を指定すると、サーバー不要で配信できるようハッシュルーターで動く */
  readonly VITE_HASH_ROUTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
