import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // merge Vercel env + .env files (so either source works)
  const fileEnv = loadEnv(mode, process.cwd(), '');
  const FRONTEND_SERVER_URL =
    process.env.FRONTEND_SERVER_URL ?? fileEnv.FRONTEND_SERVER_URL;

  if (!FRONTEND_SERVER_URL) {
    throw new Error(`FRONTEND_SERVER_URL must be defined (Vercel env or .env)`);
  }

  let url: URL;
  try {
    url = new URL(FRONTEND_SERVER_URL);
  } catch {
    throw new Error(`FRONTEND_SERVER_URL is not a valid URL: "${FRONTEND_SERVER_URL}"`);
  }

  const isHttps = url.protocol === 'https:';
  const port = url.port ? Number(url.port) : 3000;

  const https = isHttps
    ? {
        key: fileEnv.SSL_KEY_FILE,
        cert: fileEnv.SSL_CRT_FILE,
      }
    : undefined;

  return {
    plugins: [react()],
    server: {
      port,
      https,
    },
    build: {
      sourcemap: true,
    },
  };
});
