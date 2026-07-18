import { Client, Room } from "colyseus.js";
import type { Intent, SimEvent, SimSnapshot } from "@linet/shared";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:2567");

/** XHR/network failures often surface as ProgressEvent with no useful message. */
export function formatNetError(err: unknown): string {
  if (err instanceof Error && err.message && !err.message.includes("[object ProgressEvent]")) {
    return err.message;
  }
  const name = err && typeof err === "object" && "constructor" in err
    ? (err as { constructor?: { name?: string } }).constructor?.name
    : undefined;
  if (
    name === "ProgressEvent" ||
    (typeof ProgressEvent !== "undefined" && err instanceof ProgressEvent) ||
    String(err).includes("ProgressEvent")
  ) {
    return `No se pudo conectar al servidor (${SERVER_URL}). Arrancá el server: pnpm --filter @linet/server dev`;
  }
  if (typeof err === "string" && err.trim()) return err;
  return `Error de red al hablar con ${SERVER_URL}`;
}

export interface ListedRoom {
  roomId: string;
  roomName: string;
  code: string;
  hostName: string;
  clients: number;
  maxClients: number;
  phase: string;
}

export class NetClient {
  private client = new Client(SERVER_URL);
  room: Room | null = null;
  sessionId = "";
  private roomId = "";
  private reconnectionToken = "";
  onState: ((state: SimSnapshot) => void) | null = null;
  onEvent: ((event: SimEvent) => void) | null = null;
  onConnectionLost: (() => void) | null = null;
  onConnectionRestored: (() => void) | null = null;

  async listRooms(): Promise<ListedRoom[]> {
    const rooms = await this.client.getAvailableRooms("game");
    return rooms
      .map((r) => {
        const meta = (r.metadata || {}) as Record<string, unknown>;
        if (meta.solo) return null;
        if (meta.phase && meta.phase !== "lobby") return null;
        return {
          roomId: r.roomId,
          roomName: String(meta.roomName || "Sala"),
          code: String(meta.code || "—"),
          hostName: String(meta.hostName || "?"),
          clients: Number(meta.clients ?? r.clients ?? 0),
          maxClients: Number(meta.maxClients ?? 2),
          phase: String(meta.phase || "lobby"),
        } satisfies ListedRoom;
      })
      .filter((r): r is ListedRoom => r !== null && r.clients < r.maxClients);
  }

  async createRoom(playerName: string, roomName: string, code?: string): Promise<void> {
    this.leave();
    this.room = await this.client.create("game", {
      name: playerName,
      roomName: roomName || "Line Duel",
      code: code?.toUpperCase() || undefined,
      solo: false,
    });
    this.bindRoom();
  }

  async joinRoomId(roomId: string, playerName: string): Promise<void> {
    this.leave();
    this.room = await this.client.joinById(roomId, { name: playerName });
    this.bindRoom();
  }

  async joinByCode(code: string, playerName: string): Promise<void> {
    const rooms = await this.listRooms();
    const match = rooms.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (!match) throw new Error(`No hay sala abierta con código ${code.toUpperCase()}`);
    await this.joinRoomId(match.roomId, playerName);
  }

  async playSolo(playerName: string): Promise<void> {
    this.leave();
    this.room = await this.client.create("game", {
      name: playerName,
      roomName: "Solo test",
      solo: true,
    });
    this.bindRoom();
  }

  private bindRoom(): void {
    if (!this.room) return;
    this.sessionId = this.room.sessionId;
    this.roomId = this.room.roomId;
    this.reconnectionToken = this.room.reconnectionToken;
    this.room.onMessage("state", (state: SimSnapshot) => this.onState?.(state));
    this.room.onMessage("event", (event: SimEvent) => this.onEvent?.(event));

    this.room.onLeave.once((code) => {
      if (code !== 1000 && this.reconnectionToken) {
        this.onConnectionLost?.();
        void this.attemptReconnect();
      }
    });
    this.room.onError.once(() => this.onConnectionLost?.());
  }

  private async attemptReconnect(): Promise<void> {
    try {
      this.room = await this.client.reconnect(this.reconnectionToken);
      this.bindRoom();
      this.onConnectionRestored?.();
    } catch {
      // Mantenemos el overlay de desconexión; el usuario puede recargar o salir.
    }
  }

  sendIntent(intent: Intent): void {
    this.room?.send("intent", intent);
  }

  leave(): void {
    this.room?.leave();
    this.room = null;
    this.sessionId = "";
    this.roomId = "";
    this.reconnectionToken = "";
  }
}

export const net = new NetClient();
