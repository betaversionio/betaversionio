/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BETAVERSION_API_URL?: string;
  readonly VITE_PORTFOLIO_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
