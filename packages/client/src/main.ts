import Phaser from "phaser";
import { BootScene, EndScene, GameScene, LobbyScene, MenuScene } from "./scenes/index";

const startW = Math.max(800, window.innerWidth || 1280);
const startH = Math.max(600, window.innerHeight || 720);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: startW,
  height: startH,
  backgroundColor: "#0a100c",
  scene: [BootScene, MenuScene, LobbyScene, GameScene, EndScene],
  scale: {
    // Canvas always fills the parent — no letterbox bars. HUD layouts on resize.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
