// Lê de VITE_API_BASE_URL no build/dev; default '/api' (proxy via vite.config.ts).
// `||` (não `??`): a env vem como string VAZIA quando não setada (não undefined),
// e string vazia deve cair no default '/api' — senão o baseURL fica "" e as
// requisições perdem o prefixo /api do proxy.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api';
