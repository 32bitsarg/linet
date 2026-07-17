import { Client } from "colyseus.js";

const client = new Client("http://localhost:2567");

const host = await client.create("game", {
  name: "P1",
  roomName: "Smoke Room",
  code: "SMOKE",
});
console.log("created", host.roomId, host.sessionId);

const rooms = await client.getAvailableRooms("game");
console.log(
  "listed",
  rooms.map((r) => ({ id: r.roomId, meta: r.metadata })),
);

const guest = await client.joinById(host.roomId, { name: "P2" });
console.log("joined", guest.sessionId);

host.send("intent", { type: "setReady", ready: true });
guest.send("intent", { type: "setReady", ready: true });
await new Promise((r) => setTimeout(r, 400));
host.send("intent", { type: "startGame" });

await new Promise<void>((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("timeout waiting playing")), 5000);
  host.onMessage("state", (s: { phase: string; players: unknown[] }) => {
    if (s.phase === "playing") {
      clearTimeout(t);
      console.log("playing players=", s.players.length);
      resolve();
    }
  });
});

await host.leave();
await guest.leave();
console.log("OK");
process.exit(0);
