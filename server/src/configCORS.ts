// configCORS.ts
import express from "express";
import cors, { CorsOptions } from "cors";
import { logger } from "./logger";

export function configureCORS(app: express.Express) {
  // e.g. "https://web-application-bice-sigma.vercel.app, *.vercel.app"
  const raw = process.env.CORS_ORIGIN || "";
  const allowList = raw.split(",").map(s => s.trim()).filter(Boolean);
  const allowLocal = process.env.ALLOW_LOCALHOST === "true";

  if (allowList.length === 0) {
    logger.warn("CORS_ORIGIN not set — only requests without Origin will be allowed");
  } else {
    logger.info(`CORS allowlist: ${JSON.stringify(allowList)}`);
  }

  const corsOptions: CorsOptions = {
    origin(origin, cb) {
      // allow server-to-server / curl / health (no Origin header)
      if (!origin) return cb(null, true);

      try {
        const url = new URL(origin);
        const { protocol, hostname } = url;

        // exact full-origin match (must include https://)
        const exact = allowList.includes(origin);

        // wildcard for any vercel preview
        const vercelPreview =
          allowList.includes("*.vercel.app") &&
          protocol === "https:" &&
          /\.vercel\.app$/i.test(hostname);

        // optional localhost for dev
        const localhostOk =
          allowLocal &&
          /^https?:$/.test(protocol) &&
          /^(localhost|127\.0\.0\.1)$/i.test(hostname);

        if (exact || vercelPreview || localhostOk) return cb(null, true);

        // ❌ Do NOT throw here — returning an error makes Express send 500
        return cb(null, false); // deny without crashing (no CORS headers)
      } catch {
        return cb(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    maxAge: 600,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
}
