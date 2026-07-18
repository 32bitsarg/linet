import { Room, Client } from "@colyseus/core";
import {
  Intent,
  RECONNECT_SECONDS,
  Simulation,
  TICK_DT,
} from "@linet/shared";

export interface JoinOptions {
  code?: string;
  name?: string;
  roomName?: string;
  solo?: boolean;
}

function randomCode(len = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]!;
  return out;
}

export class GameRoom extends Room {
  maxClients = 2;
  private sim!: Simulation;
  private intentQueue: { sessionId: string; intent: Intent }[] = [];
  private forfeited = new Set<string>();
  private solo = false;
  private displayName = "Sala";
  private code = "";
  private hostName = "";
  private lastPhase: string = "lobby";

  onCreate(options: JoinOptions) {
    this.solo = Boolean(options.solo);
    this.code = (options.code || randomCode()).toUpperCase();
    this.displayName = (options.roomName || (this.solo ? "Solo test" : "Line Duel")).slice(0, 32);
    if (this.solo) this.maxClients = 1;

    this.sim = new Simulation(this.code);

    if (this.solo) {
      this.setPrivate(true);
    }

    this.refreshMetadata();

    this.onMessage("intent", (client, message: Intent) => {
      this.intentQueue.push({ sessionId: client.sessionId, intent: message });
    });

    this.onMessage("sync", (client) => {
      client.send("state", this.sim.snapshot());
    });

    this.setSimulationInterval(() => this.serverTick(), TICK_DT * 1000);
  }

  onJoin(client: Client, options: JoinOptions) {
    if (this.sim.phase !== "lobby") {
      client.leave(4001);
      return;
    }

    const name = options.name?.slice(0, 16) || `Player${this.clients.length}`;
    if (!this.hostName) this.hostName = name;

    const ok = this.sim.addPlayer(client.sessionId, name);
    if (!ok) {
      client.leave(4000);
      return;
    }

    if (this.solo || options.solo) {
      this.solo = true;
      this.maxClients = 1;
      this.setPrivate(true);
      this.sim.enableSoloWithBot();
      this.sim.enqueueIntent(client.sessionId, { type: "setReady", ready: true });
      this.sim.enqueueIntent(client.sessionId, { type: "startGame" });
    }

    this.updateListingLock();
    this.refreshMetadata();
    this.broadcast("state", this.sim.snapshot());
  }

  async onLeave(client: Client, consented: boolean) {
    if (consented || this.sim.phase === "lobby") {
      this.sim.removePlayer(client.sessionId);
      this.updateListingLock();
      this.refreshMetadata();
      this.broadcast("state", this.sim.snapshot());
      return;
    }

    this.sim.setConnected(client.sessionId, false);
    this.refreshMetadata();
    this.broadcast("state", this.sim.snapshot());

    try {
      await this.allowReconnection(client, RECONNECT_SECONDS);
      this.sim.setConnected(client.sessionId, true);
      this.forfeited.delete(client.sessionId);
      this.refreshMetadata();
      this.broadcast("state", this.sim.snapshot());
    } catch {
      if (!this.forfeited.has(client.sessionId)) {
        this.forfeited.add(client.sessionId);
        this.sim.forfeit(client.sessionId);
        this.refreshMetadata();
        this.broadcast("state", this.sim.snapshot());
      }
    }
  }

  private serverTick() {
    let dirty = this.intentQueue.length > 0;
    while (this.intentQueue.length) {
      const item = this.intentQueue.shift()!;
      this.sim.enqueueIntent(item.sessionId, item.intent);
      dirty = true;
    }

    if (this.sim.phase === "playing") {
      const events = this.sim.step();
      for (const e of events) {
        this.broadcast("event", e);
      }
      dirty = true;
    }

    if (this.sim.phase !== this.lastPhase) {
      this.lastPhase = this.sim.phase;
      this.updateListingLock();
      this.refreshMetadata();
      dirty = true;
    }

    if (dirty) {
      this.broadcast("state", this.sim.snapshot());
    }
  }

  private updateListingLock(): void {
    if (this.solo) {
      this.setPrivate(true);
      if (!this.locked) this.lock();
      return;
    }

    const seatsTaken = this.clients.length;
    const inGame = this.sim.phase === "playing";
    const shouldLock = inGame || seatsTaken >= this.maxClients;

    if (shouldLock) {
      if (!this.locked) this.lock();
    } else if (this.locked) {
      this.unlock();
    }
  }

  private refreshMetadata(): void {
    void this.setMetadata({
      roomName: this.displayName,
      code: this.code,
      hostName: this.hostName,
      clients: this.clients.length,
      maxClients: this.maxClients,
      phase: this.sim.phase,
      solo: this.solo,
    });
  }
}
