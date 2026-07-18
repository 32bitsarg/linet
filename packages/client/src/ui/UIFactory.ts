import Phaser from "phaser";

export const UI = {
  fontTitle: "Bebas Neue, Impact, sans-serif",
  fontBody: "Sora, sans-serif",
  fontBodyWithEmoji:
    "Sora, 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
  fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  colors: {
    gold: 0xd8c49a,
    goldText: "#d8c49a",
    green: 0x6fbf78,
    greenText: "#6fbf78",
    red: 0xc45a4a,
    redText: "#c45a4a",
    blue: 0x6ab0d8,
    blueText: "#6ab0d8",
    darkBg: 0x080c09,
    panelBg: 0x101612,
    panelBorder: 0x2a3a30,
    textLight: "#e8f0e0",
    textMuted: "#9aa898",
    textDark: "#111111",
    disabled: 0x4a4a4a,
  },
  z: {
    background: 0,
    world: 10,
    creeps: 20,
    creepBars: 22,
    towers: 30,
    range: 25,
    panels: 80,
    hud: 90,
    banner: 100,
    modal: 200,
  },
};

export interface ButtonOptions {
  width?: number;
  height?: number;
  color?: number;
  borderColor?: number;
  textColor?: string;
  fontSize?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export interface ButtonResult {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  opts: ButtonOptions = {},
): ButtonResult {
  const width = opts.width ?? 96;
  const height = opts.height ?? 44;
  const color = opts.disabled ? UI.colors.disabled : (opts.color ?? UI.colors.panelBg);
  const borderColor = opts.selected
    ? UI.colors.gold
    : opts.disabled
      ? 0x555555
      : (opts.borderColor ?? UI.colors.panelBorder);
  const textColor = opts.disabled ? "#777777" : (opts.textColor ?? UI.colors.textLight);
  const fontSize = opts.fontSize ?? "12px";

  const bg = scene.add
    .rectangle(0, 0, width, height, color)
    .setStrokeStyle(opts.selected ? 2 : 1, borderColor)
    .setInteractive({ useHandCursor: !opts.disabled });

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: UI.fontBody,
      fontSize,
      color: textColor,
      align: "center",
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [bg, text]).setDepth(UI.z.panels);

  if (!opts.disabled && opts.onClick) {
    bg.on("pointerdown", opts.onClick);
    bg.on("pointerover", () => {
      bg.setFillStyle(Phaser.Display.Color.GetColor(
        Math.min(255, ((color >> 16) & 0xff) + 20),
        Math.min(255, ((color >> 8) & 0xff) + 20),
        Math.min(255, (color & 0xff) + 20),
      ));
    });
    bg.on("pointerout", () => bg.setFillStyle(color));
  }

  return { container, bg, text };
}

export interface PanelOptions {
  color?: number;
  borderColor?: number;
  alpha?: number;
  radius?: number;
}

export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  opts: PanelOptions = {},
): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(x, y, width, height, opts.color ?? UI.colors.panelBg, opts.alpha ?? 0.92)
    .setStrokeStyle(1, opts.borderColor ?? UI.colors.panelBorder)
    .setDepth(UI.z.panels);
}

export function createBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: number,
): Phaser.GameObjects.Container {
  const label = scene.add
    .text(0, 0, text, {
      fontFamily: UI.fontBody,
      fontSize: "11px",
      color: UI.colors.textDark,
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const w = Math.max(36, label.width + 12);
  const bg = scene.add.rectangle(0, 0, w, 18, color).setDepth(UI.z.hud);
  const c = scene.add.container(x, y, [bg, label]).setDepth(UI.z.hud);
  return c;
}

export function createStyledText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: "title" | "body" | "small" | "mono",
  color?: string,
): Phaser.GameObjects.Text {
  const styles: Record<string, object> = {
    title: { fontFamily: UI.fontTitle, fontSize: "28px", color: color ?? UI.colors.goldText },
    body: { fontFamily: UI.fontBody, fontSize: "13px", color: color ?? UI.colors.textLight },
    small: { fontFamily: UI.fontBody, fontSize: "11px", color: color ?? UI.colors.textMuted },
    mono: { fontFamily: UI.fontMono, fontSize: "12px", color: color ?? UI.colors.textLight },
  };
  return scene.add.text(x, y, text, styles[style]).setDepth(UI.z.hud);
}

export function createIconText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  icon: string,
  value: string,
  color: string,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, `${icon} ${value}`, {
      fontFamily: UI.fontBodyWithEmoji,
      fontSize: "14px",
      color,
      fontStyle: "bold",
    })
    .setDepth(UI.z.hud);
}

export function createBanner(
  scene: Phaser.Scene,
  width: number,
  height: number,
): Phaser.GameObjects.Text {
  return scene.add
    .text(width / 2, 56, "", {
      fontFamily: UI.fontTitle,
      fontSize: "32px",
      color: UI.colors.goldText,
      letterSpacing: 2,
    })
    .setOrigin(0.5)
    .setDepth(UI.z.banner);
}

export function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${value}`;
}

export function formatCountdown(seconds: number): string {
  return Math.max(0, seconds).toFixed(1);
}
