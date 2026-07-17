import Phaser from "phaser";
import type { SimSnapshot } from "@linet/shared";
import { net } from "../net";
import { bindOverlayCleanup, mountOverlay, syncOverlayToCanvas } from "../ui";

export class EndScene extends Phaser.Scene {
  constructor() {
    super("end");
  }

  create(data: { state: SimSnapshot }) {
    const { width, height } = this.scale;
    const state = data.state;
    this.add.rectangle(0, 0, width, height, 0x0a120e).setOrigin(0);
    const won = state.winnerSessionId === net.sessionId;

    const lines = state.players
      .map((p) => {
        const you = p.sessionId === net.sessionId ? " (vos)" : "";
        return `<div class="player-card"><span>${p.name}${you}</span><span class="badge">${p.lives}❤ · ${p.totalLeaks} leaks · ${p.totalGoldEarned}G</span></div>`;
      })
      .join("");

    const root = mountOverlay(`
      <div class="shell compact">
        <div class="panel">
          <div class="brand">
            <div class="brand-mark" style="font-size:56px;color:${won ? "#6fbf78" : "#c45a4a"}">${won ? "VICTORIA" : "DERROTA"}</div>
            <div class="brand-rule"></div>
          </div>
          <p class="subtitle">${state.soloMode ? "Partida de prueba (solo)" : "Fin de la room"}</p>
          <div class="players">${lines}</div>
          <div class="actions">
            <button type="button" id="btn-rematch">Rematch</button>
            <button type="button" class="danger" id="btn-leave">Menú</button>
          </div>
        </div>
      </div>
    `);
    bindOverlayCleanup(this);
    this.time.delayedCall(0, () => syncOverlayToCanvas());

    root.querySelector("#btn-rematch")!.addEventListener("click", () => {
      net.sendIntent({ type: "rematch" });
      if (state.soloMode) {
        net.sendIntent({ type: "setReady", ready: true });
        net.sendIntent({ type: "startGame" });
        this.scene.start("game");
      } else {
        this.scene.start("lobby");
      }
    });
    root.querySelector("#btn-leave")!.addEventListener("click", () => {
      net.leave();
      this.scene.start("menu");
    });

    net.onState = (s) => {
      if (s.phase === "playing") this.scene.start("game");
      if (s.phase === "lobby" && !state.soloMode) this.scene.start("lobby");
    };
  }
}
