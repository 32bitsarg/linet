import Phaser from "phaser";
import { preloadCreepSprites, registerCreepAnimations } from "../fx/creepSprites";
import { generateGroundTextures } from "../fx/groundTextures";
import { preloadTowerSprites, registerTowerAnimations } from "../fx/towerSprites";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    preloadTowerSprites(this);
    preloadCreepSprites(this);
  }

  create() {
    generateGroundTextures(this, 64);
    registerTowerAnimations(this);
    registerCreepAnimations(this);
    this.scene.start("menu");
  }
}
