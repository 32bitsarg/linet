import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { GameRoom } from "./GameRoom.js";

const PORT = Number(process.env.PORT || 2567);

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Linet server</title></head>
<body style="font-family:system-ui;background:#121612;color:#e8f0e0;padding:2rem">
  <h1>Linet — server Colyseus</h1>
  <p>Esto es solo el backend (WebSocket). El juego corre en el cliente Vite.</p>
  <p><a style="color:#a5d6a7" href="http://localhost:5173">Abrir juego → http://localhost:5173</a></p>
  <p>Si no carga, en otra terminal: <code>pnpm --filter @linet/client dev</code></p>
</body></html>`);
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define("game", GameRoom).enableRealtimeListing();

await gameServer.listen(PORT);
console.log(`[linet-server] listening on http://localhost:${PORT}`);
