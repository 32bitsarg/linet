"""Bake pixel-art creep spritesheets (RGBA PNG) for Linet client.

Each creep: 6 walk frames x 40x40 px -> 240x40 sheet.
Frames 0-5: walk cycle (bob + limb shift).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "packages" / "client" / "public" / "assets" / "creeps"
FW, FH = 40, 40
FRAMES = 6
OUTLINE = (20, 18, 16, 255)


def new_frame() -> Image.Image:
    return Image.new("RGBA", (FW, FH), (0, 0, 0, 0))


def px(draw: ImageDraw.ImageDraw, x: int, y: int, c: tuple[int, int, int, int]) -> None:
    if 0 <= x < FW and 0 <= y < FH:
        draw.point((x, y), fill=c)


def fill_rect(
    draw: ImageDraw.ImageDraw,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    c: tuple[int, int, int, int],
) -> None:
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            px(draw, x, y, c)


def oval(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
    c: tuple[int, int, int, int],
) -> None:
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            dx = (x - cx) / max(rx, 1)
            dy = (y - cy) / max(ry, 1)
            if dx * dx + dy * dy <= 1.05:
                px(draw, x, y, c)


def shadow(draw: ImageDraw.ImageDraw, cy: int = 34) -> None:
    oval(draw, 20, cy, 10, 3, (0, 0, 0, 90))


def draw_grub(draw: ImageDraw.ImageDraw, frame: int) -> None:
    # chubby green grub, hop walk
    bob = [0, -1, -2, -1, 0, 1][frame]
    leg = [0, 1, 2, 1, 0, -1][frame]
    body = (120, 180, 60, 255)
    body_dk = (70, 120, 40, 255)
    body_lt = (160, 210, 90, 255)
    eye = (30, 30, 20, 255)
    shadow(draw, 35)
    oval(draw, 20, 24 + bob, 11, 8, body_dk)
    oval(draw, 20, 23 + bob, 10, 7, body)
    oval(draw, 18, 21 + bob, 4, 3, body_lt)
    # segments
    for i, ox in enumerate((-6, 0, 6)):
        oval(draw, 20 + ox, 26 + bob, 4, 4, body if i != 1 else body_lt)
    px(draw, 16, 20 + bob, eye)
    px(draw, 18, 20 + bob, eye)
    # tiny feet
    fill_rect(draw, 14, 32 + bob + leg, 16, 33 + bob + leg, body_dk)
    fill_rect(draw, 23, 32 + bob - leg, 25, 33 + bob - leg, body_dk)


def draw_runner(draw: ImageDraw.ImageDraw, frame: int) -> None:
    # lean yellow runner, long stride
    bob = [0, -1, 0, -1, 0, -1][frame]
    stride = [-3, -1, 2, 3, 1, -2][frame]
    body = (230, 180, 40, 255)
    body_dk = (170, 120, 20, 255)
    body_lt = (250, 220, 100, 255)
    shadow(draw, 36)
    # legs
    fill_rect(draw, 16 + stride, 28 + bob, 18 + stride, 34 + bob, body_dk)
    fill_rect(draw, 22 - stride, 28 + bob, 24 - stride, 34 + bob, body_dk)
    # torso
    fill_rect(draw, 17, 16 + bob, 23, 28 + bob, body)
    fill_rect(draw, 17, 16 + bob, 18, 28 + bob, body_lt)
    # head
    oval(draw, 20, 13 + bob, 5, 5, body)
    oval(draw, 20, 12 + bob, 4, 4, body_lt)
    px(draw, 22, 12 + bob, (40, 30, 10, 255))
    # arm swing
    fill_rect(draw, 14 - stride // 2, 18 + bob, 16 - stride // 2, 24 + bob, body_dk)
    fill_rect(draw, 24 + stride // 2, 18 + bob, 26 + stride // 2, 24 + bob, body_dk)


def draw_brute(draw: ImageDraw.ImageDraw, frame: int) -> None:
    # big red armored tank, heavy stomp
    bob = [0, 0, -1, 0, 0, 1][frame]
    stomp = [0, 1, 0, 0, 1, 0][frame]
    body = (200, 80, 70, 255)
    body_dk = (140, 45, 40, 255)
    armor = (160, 150, 140, 255)
    armor_dk = (100, 95, 90, 255)
    shadow(draw, 36)
    # legs
    fill_rect(draw, 12, 28 + bob + stomp, 17, 36 + bob + stomp, body_dk)
    fill_rect(draw, 23, 28 + bob - stomp, 28, 36 + bob - stomp, body_dk)
    # body
    fill_rect(draw, 10, 14 + bob, 30, 30 + bob, body_dk)
    fill_rect(draw, 12, 15 + bob, 28, 28 + bob, body)
    # armor plates
    fill_rect(draw, 13, 16 + bob, 18, 22 + bob, armor)
    fill_rect(draw, 22, 16 + bob, 27, 22 + bob, armor)
    fill_rect(draw, 13, 16 + bob, 18, 17 + bob, armor_dk)
    # head / horns
    oval(draw, 20, 11 + bob, 6, 5, body)
    fill_rect(draw, 12, 8 + bob, 14, 12 + bob, armor_dk)
    fill_rect(draw, 26, 8 + bob, 28, 12 + bob, armor_dk)
    px(draw, 17, 10 + bob, (255, 220, 80, 255))
    px(draw, 23, 10 + bob, (255, 220, 80, 255))


def draw_shade(draw: ImageDraw.ImageDraw, frame: int) -> None:
    # purple ethereal wisp, float + flicker
    bob = [-1, -2, -1, 0, -1, -2][frame]
    flick = frame % 2
    body = (120, 70, 190, 255)
    body_lt = (180, 130, 230, 255)
    body_glow = (200, 170, 255, 180)
    core = (240, 220, 255, 255)
    shadow(draw, 36)
    # trailing wisps
    oval(draw, 14, 28 + bob, 4, 6, (90, 50, 150, 120))
    oval(draw, 26, 30 + bob, 3, 5, (90, 50, 150, 100))
    oval(draw, 20, 22 + bob, 9, 11, body)
    oval(draw, 20, 20 + bob, 7, 8, body_lt)
    oval(draw, 20, 18 + bob, 4, 4, core)
    if flick:
        oval(draw, 20, 16 + bob, 10, 12, body_glow)
    # eyes
    px(draw, 17, 19 + bob, (255, 255, 255, 255))
    px(draw, 22, 19 + bob, (255, 255, 255, 255))


def draw_boss(draw: ImageDraw.ImageDraw, frame: int) -> None:
    # large red boss, menacing stomp + glow
    bob = [0, -1, 0, 1, 0, -1][frame]
    pulse = frame % 3 == 0
    body = (180, 30, 35, 255)
    body_dk = (110, 15, 20, 255)
    body_lt = (220, 60, 50, 255)
    gold = (220, 180, 60, 255)
    shadow(draw, 37)
    # legs
    fill_rect(draw, 10, 26 + bob, 16, 37 + bob, body_dk)
    fill_rect(draw, 24, 26 + bob, 30, 37 + bob, body_dk)
    # torso
    fill_rect(draw, 8, 12 + bob, 32, 28 + bob, body_dk)
    fill_rect(draw, 10, 13 + bob, 30, 26 + bob, body)
    fill_rect(draw, 12, 14 + bob, 18, 20 + bob, body_lt)
    # crown / spikes
    for ox in (12, 20, 28):
        fill_rect(draw, ox - 1, 6 + bob, ox + 1, 13 + bob, gold)
    oval(draw, 20, 10 + bob, 8, 6, body)
    px(draw, 16, 9 + bob, (255, 240, 100, 255))
    px(draw, 24, 9 + bob, (255, 240, 100, 255))
    if pulse:
        oval(draw, 20, 18 + bob, 14, 12, (255, 80, 60, 70))


DRAWERS = {
    "grub": draw_grub,
    "runner": draw_runner,
    "brute": draw_brute,
    "shade": draw_shade,
    "boss_1": draw_boss,
}


def bake_one(creep_id: str) -> Path:
    sheet = Image.new("RGBA", (FW * FRAMES, FH), (0, 0, 0, 0))
    drawer = DRAWERS[creep_id]
    for f in range(FRAMES):
        frame = new_frame()
        draw = ImageDraw.Draw(frame)
        drawer(draw, f)
        sheet.paste(frame, (f * FW, 0), frame)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{creep_id}.png"
    sheet.save(path, "PNG")
    return path


def main() -> None:
    for creep_id in DRAWERS:
        path = bake_one(creep_id)
        print(f"wrote {path} ({FW * FRAMES}x{FH})")


if __name__ == "__main__":
    main()
