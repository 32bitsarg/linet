import Phaser from "phaser";
import { MAP } from "@linet/shared";
import { BootScene, EndScene, GameScene, LobbyScene, MenuScene } from "./scenes/index";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: MAP.width,
  height: MAP.height,
  backgroundColor: "#121612",
  scene: [BootScene, MenuScene, LobbyScene, GameScene, EndScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
