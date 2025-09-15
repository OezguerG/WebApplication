import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all envs (including non-VITE_ ones)
  const env = loadEnv(mode, process.cwd(), '')

  const isDev = mode === 'development'

  // In prod (Vercel), we do NOT need a dev server; don't enforce FRONTEND_SERVER_URL
  // In dev, we keep your original behavior (parse URL, optional HTTPS certs, port)
  let server: Record<string, any> | undefined

  if (isDev) {
    const url = env.FRONTEND_SERVER_URL || 'http://localhost:5173'

    // Allow hyphens in hostnames (Vercel/others), optional port
    const res = /^(https?):\/\/[0-9a-z._-]+(?::([0-9]+))?$/i.exec(url)
    if (!res) {
      throw new Error(
        `FRONTEND_SERVER_URL must be a valid URL like http://localhost:5173 (got "${url}")`
      )
    }

    // Optional HTTPS certs for local HTTPS
    const https =
      res[1].toLowerCase() === 'https'
        ? {
            key: env.SSL_KEY_FILE,
            cert: env.SSL_CRT_FILE,
          }
        : undefined

    const port = res[2] ? Number(res[2]) : 3000

    server = {
      port,
      https,
    }
  }

  return {
    plugins: [react()],
    server, // undefined in prod; honored in dev
    build: {
      sourcemap: true,
    },
  }
})
