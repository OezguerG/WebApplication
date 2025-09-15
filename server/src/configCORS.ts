// configCORS.ts
// istanbul ignore file
import express from "express";
import cors, { CorsOptions } from "cors";
import { logger } from "./logger";

export function configureCORS(app: express.Express) {
  const raw = process.env.CORS_ORIGIN || "";
  const staticList = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean); // e.g. ["https://your-frontend.vercel.app", "*.vercel.app"]

  if (staticList.length === 0) {
    logger.warn("WARNING: CORS_ORIGIN not set — no origins will be allowed");
  }

  const corsOptions: CorsOptions = {
    origin(origin, cb) {
      // Allow non-browser calls (no Origin), e.g. curl/health checks
      if (!origin) return cb(null, true);

      try {
        const u = new URL(origin);
        const host = u.hostname;

        // exact match list
        const allowExact = staticList.includes(origin);

        // wildcard support for *.vercel.app previews
        const allowWildcard = staticList.some(
          v => v === "*.vercel.app" && /(?:^|\.)vercel\.app$/i.test(host)
        );

        const allowed = allowExact || allowWildcard;
        return cb(allowed ? null : new Error("CORS: Origin not allowed"), allowed);
      } catch {
        return cb(new Error("CORS: Bad Origin"), false);
      }
    },
    credentials: true, // matches your fetch(..., { credentials: "include" })
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  // IMPORTANT: use the SAME options for preflight
  app.options("*", cors(corsOptions));
}
