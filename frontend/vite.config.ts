import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// O target do proxy `/api` muda conforme onde Vite está rodando:
//   - **no container Docker**: `http://backend:8000` (DNS interno do compose).
//   - **no host macOS** (recomendado em Colima por HMR confiável): `http://localhost:8000`
//     (porta do container backend exposta no host).
// Defina via `VITE_PROXY_TARGET` num `.env.local`; default mantém compat
// com o container.
export default defineConfig(({ mode }) => {
  // O `.env` mora na raiz do repo (compartilhado com Django/compose), não em
  // `frontend/`. Por isso passamos `..` como `envDir` em loadEnv.
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://backend:8000';

  return {
    plugins: [react()],
    // `.env` mora na raiz; faz `import.meta.env.VITE_*` ler de lá também.
    envDir: path.resolve(__dirname, '..'),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
