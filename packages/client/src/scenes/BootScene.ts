import Phaser from "phaser";
import { generateGroundTextures } from "../fx/groundTextures";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    generateGroundTextures(this, 64);
    this.scene.start("menu");
  }
}
