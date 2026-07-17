import Phaser from "phaser";
import type { SimSnapshot } from "@linet/shared";
import { net } from "../net";
import { bindOverlayCleanup, mountOverlay, syncOverlayToCanvas } from "../ui";

export class LobbyScene extends Phaser.Scene {
  private state: SimSnapshot | null = null;

  constructor() {
    super("lobby");
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a120e, 0x0a120e, 0x152218, 0x1a281c, 1);
    bg.fillRect(0, 0, width, height);

    const root = mountOverlay(`
      <div class="shell compact">
        <div class="panel">
          <div class="brand">
            <div class="brand-mark" style="font-size:56px">LOBBY</div>
            <div class="brand-rule"></div>
          </div>
          <p class="subtitle">Esperá al rival o dale Ready</p>
          <p class="status" id="status">Conectando…</p>
          <div class="code-big" id="code">————</div>
          <p class="hint" style="text-align:center;margin-bottom:12px">Compartí este código</p>
          <div class="players" id="players"></div>
          <div class="actions">
            <div class="row">
              <button type="button" id="btn-ready">Ready</button>
              <button type="button" id="btn-start">Start (host)</button>
            </div>
            <button type="button" class="danger" id="btn-leave">Salir</button>
          </div>
          <p class="error" id="err"></p>
        </div>
      </div>
    `);
    bindOverlayCleanup(this);
    this.time.delayedCall(0, () => syncOverlayToCanvas());

    root.querySelector("#btn-ready")!.addEventListener("click", () => {
      const me = this.state?.players.find((p) => p.sessionId === net.sessionId);
      net.sendIntent({ type: "setReady", ready: !me?.ready });
    });
    root.querySelector("#btn-start")!.addEventListener("click", () => {
      net.sendIntent({ type: "startGame" });
    });
    root.querySelector("#btn-leave")!.addEventListener("click", () => {
      net.leave();
      this.scene.start("menu");
    });

    net.onState = (s) => {
      this.state = s;
      if (s.phase === "playing") {
        this.scene.start("game");
        return;
      }
      this.renderLobby();
    };
    net.onEvent = () => undefined;
  }

  private renderLobby() {
    if (!this.state) return;
    const codeEl = document.querySelector("#linet-ui #code");
    const statusEl = document.querySelector("#linet-ui #status");
    const playersEl = document.querySelector("#linet-ui #players");
    const readyBtn = document.querySelector("#linet-ui #btn-ready") as HTMLButtonElement | null;
    if (!codeEl || !statusEl || !playersEl) return;

    codeEl.textContent = this.state.roomCode;
    const isHost = this.state.hostSessionId === net.sessionId;
    statusEl.textContent = this.state.soloMode
      ? "Modo solo (bot)"
      : `${this.state.players.length}/2 jugadores · Host: ${isHost ? "vos" : "otro"}`;

    playersEl.innerHTML = this.state.players
      .map((p) => {
        const you = p.sessionId === net.sessionId ? " (vos)" : "";
        const badge = p.ready ? "ready" : "";
        const badgeText = p.ready ? "READY" : "ESPERANDO";
        return `<div class="player-card"><span>${p.name}${you} · lane ${p.laneIndex}</span><span class="badge ${badge}">${badgeText}</span></div>`;
      })
      .join("");

    const me = this.state.players.find((p) => p.sessionId === net.sessionId);
    if (readyBtn) readyBtn.textContent = me?.ready ? "Cancelar ready" : "Ready";
  }
}
