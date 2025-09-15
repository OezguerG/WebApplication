/* istanbul ignore file */
import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./app";
import { prefillDB } from "./prefill"; // keep if you have it
// If you have a logger module, import and use it; else use console.
const logger = console as any;

async function setup() {
  let mongoUri = process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING;
  if (!mongoUri) {
    logger.error('Set MONGODB_URI or DB_CONNECTION_STRING (or "memory" in dev).');
    process.exit(1);
  }

  if (mongoUri === "memory") {
    if (process.env.NODE_ENV === "production") {
      logger.error("Refusing to start MongoMemoryServer in production.");
      process.exit(1);
    }
    logger.info("Starting MongoMemoryServer...");
    const MMS = await import("mongodb-memory-server");
    const mongo = await MMS.MongoMemoryServer.create();
    mongoUri = mongo.getUri();
  }

  logger.info(`Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  if (process.env.DB_PREFILL === "true") {
    logger.info("DB_PREFILL=true → running prefillDB()");
    await prefillDB();
  }

  const port = Number(process.env.PORT) || Number(process.env.HTTP_PORT) || 3000;
  const host = "0.0.0.0";
  const server = http.createServer(app);

  server.listen(port, host, () => {
    logger.info(`HTTP listening on ${host}:${port}`);
  });

  const shutdown = async (sig: NodeJS.Signals) => {
    try {
      logger.info(`Received ${sig}, shutting down...`);
      await new Promise<void>((resolve, reject) => server.close(err => (err ? reject(err) : resolve())));
      await mongoose.connection.close();
      process.exit(0);
    } catch (e: any) {
      logger.error(`Shutdown error: ${e?.message}`);
      process.exit(1);
    }
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

setup().catch(err => {
  console.error(`Fatal startup error: ${(err as Error).message}`);
  process.exit(1);
});
