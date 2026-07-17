import Phaser from "phaser";
import { formatNetError, net } from "../net";
import { bindOverlayCleanup, mountOverlay, syncOverlayToCanvas } from "../ui";

export class MenuScene extends Phaser.Scene {
  private refreshTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("menu");
  }

  create() {
    const { width, height } = this.scale;
    this.drawAtmosphere(width, height);

    const root = mountOverlay(`
      <div class="shell">
        <div class="panel">
          <div class="brand">
            <div class="brand-mark">LINET</div>
            <div class="brand-rule"></div>
          </div>
          <p class="subtitle">Armá tu laberinto. Mandá creeps. Rompé la línea rival.</p>

          <div class="field">
            <label for="name">Comandante</label>
            <input id="name" maxlength="16" value="Commander" autocomplete="off" />
          </div>

          <div class="menu-grid">
            <div>
              <p class="menu-col-title">Salas abiertas</p>
              <div class="section-title">
                <span></span>
                <button type="button" class="secondary" id="btn-refresh" style="flex:0;padding:6px 10px;font-size:11px">Actualizar</button>
              </div>
              <div class="room-list" id="room-list">
                <div class="empty-list">Cargando…</div>
              </div>
            </div>
            <div>
              <p class="menu-col-title">Nueva partida</p>
              <div class="field">
                <label for="roomName">Nombre de sala</label>
                <input id="roomName" maxlength="32" value="Line Duel" autocomplete="off" />
              </div>
              <div class="field">
                <label for="code">Código</label>
                <input id="code" maxlength="8" placeholder="Vacío = aleatorio" autocomplete="off" />
              </div>
              <div class="actions" style="margin-top:8px">
                <button type="button" id="btn-create">Crear sala</button>
                <button type="button" class="secondary" id="btn-join-code">Unirse por código</button>
                <button type="button" class="solo" id="btn-solo">Probar solo</button>
              </div>
            </div>
          </div>
          <p class="error" id="err"></p>
        </div>
      </div>
    `);
    bindOverlayCleanup(this);
    this.time.delayedCall(0, () => syncOverlayToCanvas());

    const nameEl = root.querySelector("#name") as HTMLInputElement;
    const roomNameEl = root.querySelector("#roomName") as HTMLInputElement;
    const codeEl = root.querySelector("#code") as HTMLInputElement;
    const errEl = root.querySelector("#err") as HTMLElement;
    const listEl = root.querySelector("#room-list") as HTMLElement;

    const showErr = (err: unknown) => {
      errEl.textContent = formatNetError(err);
    };

    const refreshList = async () => {
      try {
        const rooms = await net.listRooms();
        if (!rooms.length) {
          listEl.innerHTML = `<div class="empty-list">No hay salas. Creá la primera.</div>`;
          return;
        }
        listEl.innerHTML = rooms
          .map(
            (r) => `
            <div class="room-row" data-id="${r.roomId}">
              <div class="meta">
                <strong>${escapeHtml(r.roomName)}</strong>
                <span>${escapeHtml(r.code)} · ${r.clients}/${r.maxClients} · ${escapeHtml(r.hostName)}</span>
              </div>
              <button type="button" data-join="${r.roomId}">Entrar</button>
            </div>`,
          )
          .join("");
        listEl.querySelectorAll("[data-join]").forEach((btn) => {
          btn.addEventListener("click", () => {
            void (async () => {
              errEl.textContent = "";
              try {
                await net.joinRoomId((btn as HTMLElement).dataset.join!, nameEl.value.trim() || "Commander");
                this.scene.start("lobby");
              } catch (err) {
                showErr(err);
              }
            })();
          });
        });
      } catch (err) {
        listEl.innerHTML = `<div class="empty-list">Sin servidor — ¿está corriendo?</div>`;
        showErr(err);
      }
    };

    root.querySelector("#btn-refresh")!.addEventListener("click", () => void refreshList());
    root.querySelector("#btn-create")!.addEventListener("click", () => {
      void (async () => {
        errEl.textContent = "";
        try {
          await net.createRoom(
            nameEl.value.trim() || "Commander",
            roomNameEl.value.trim() || "Line Duel",
            codeEl.value.trim() || undefined,
          );
          this.scene.start("lobby");
        } catch (err) {
          showErr(err);
        }
      })();
    });
    root.querySelector("#btn-join-code")!.addEventListener("click", () => {
      void (async () => {
        errEl.textContent = "";
        const code = codeEl.value.trim();
        if (!code) {
          errEl.textContent = "Ingresá un código para unirte.";
          return;
        }
        try {
          await net.joinByCode(code, nameEl.value.trim() || "Commander");
          this.scene.start("lobby");
        } catch (err) {
          showErr(err);
        }
      })();
    });
    root.querySelector("#btn-solo")!.addEventListener("click", () => {
      void (async () => {
        errEl.textContent = "";
        try {
          await net.playSolo(nameEl.value.trim() || "Commander");
          this.scene.start("game");
        } catch (err) {
          showErr(err);
        }
      })();
    });

    void refreshList();
    this.refreshTimer = this.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => void refreshList(),
    });
    this.events.once("shutdown", () => this.refreshTimer?.remove(false));
  }

  private drawAtmosphere(width: number, height: number) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x0a120e, 0x0a120e, 0x152218, 0x1a281c, 1);
    bg.fillRect(0, 0, width, height);

    // Soft vignette bands
    this.add.rectangle(0, 0, width, 90, 0x050805, 0.55).setOrigin(0).setDepth(1);
    this.add.rectangle(0, height - 110, width, 110, 0x050805, 0.45).setOrigin(0).setDepth(1);

    // Ghost twin mazes in the background
    const ghost = this.add.graphics().setDepth(1).setAlpha(0.22);
    this.drawGhostLane(ghost, 90, 100, 0x6fbf78);
    this.drawGhostLane(ghost, 760, 100, 0xc45a4a);

    this.tweens.add({
      targets: ghost,
      alpha: { from: 0.14, to: 0.28 },
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const drift = this.add
      .text(width / 2, height - 36, "1v1  ·  laberinto  ·  sends", {
        fontFamily: "Sora, sans-serif",
        fontSize: "13px",
        color: "#7f9578",
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setAlpha(0.7);

    this.tweens.add({
      targets: drift,
      alpha: { from: 0.45, to: 0.85 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private drawGhostLane(g: Phaser.GameObjects.Graphics, ox: number, oy: number, tint: number) {
    const cols = 10;
    const rows = 12;
    const cell = 28;
    g.lineStyle(2, tint, 0.9);
    g.strokeRect(ox, oy, cols * cell, rows * cell);
    g.lineStyle(1, tint, 0.35);
    for (let c = 0; c <= cols; c++) {
      const x = ox + c * cell;
      g.lineBetween(x, oy, x, oy + rows * cell);
    }
    for (let r = 0; r <= rows; r++) {
      const y = oy + r * cell;
      g.lineBetween(ox, y, ox + cols * cell, y);
    }
    // Fake maze walls
    g.fillStyle(tint, 0.45);
    const walls = [
      [2, 2],
      [3, 2],
      [4, 2],
      [6, 4],
      [6, 5],
      [6, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [7, 8],
      [8, 8],
      [4, 10],
      [5, 10],
    ];
    for (const [c, r] of walls) {
      g.fillRect(ox + c! * cell + 2, oy + r! * cell + 2, cell - 4, cell - 4);
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
