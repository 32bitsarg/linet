import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { GameRoom } from "./GameRoom.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 2567);
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN || true,
    credentials: false,
  }),
);
app.get("/health", (_req, res) => res.json({ ok: true }));

// Serve built client if it exists (production / single-service deploy)
const clientDist = join(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.type("html").send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Linet server</title></head>
<body style="font-family:system-ui;background:#121612;color:#e8f0e0;padding:2rem">
  <h1>Linet — server Colyseus</h1>
  <p>Esto es solo el backend (WebSocket). El juego corre en el cliente Vite.</p>
  <p>Si no carga, en otra terminal: <code>pnpm --filter @linet/client dev</code></p>
</body></html>`);
  });
}

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define("game", GameRoom).enableRealtimeListing();

await gameServer.listen(PORT);
console.log(`[linet-server] listening on port ${PORT}`);

process.on("SIGTERM", async () => {
  console.log("[linet-server] SIGTERM received, shutting down gracefully");
  await gameServer.gracefullyShutdown();
  httpServer.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  console.log("[linet-server] SIGINT received, shutting down gracefully");
  await gameServer.gracefullyShutdown();
  httpServer.close(() => process.exit(0));
});
