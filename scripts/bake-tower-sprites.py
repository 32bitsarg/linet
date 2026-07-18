"""Bake pixel-art tower spritesheets (RGBA PNG) for Linet client.

Each tower: 6 frames x 48x56 px -> 288x56 sheet.
Frames 0-2: idle bob; 3-5: attack recoil + flash.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "packages" / "client" / "public" / "assets" / "towers"
FW, FH = 48, 56
FRAMES = 6
SHEET_W, SHEET_H = FW * FRAMES, FH

STONE = (90, 88, 82, 255)
STONE_HI = (120, 116, 108, 255)
STONE_LO = (60, 58, 54, 255)
OUTLINE = (28, 26, 24, 255)


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


def draw_pedestal(draw: ImageDraw.ImageDraw, bob: int = 0) -> None:
    fill_rect(draw, 14, 46 + bob, 33, 53 + bob, STONE)
    fill_rect(draw, 14, 46 + bob, 33, 47 + bob, STONE_HI)
    fill_rect(draw, 14, 52 + bob, 33, 53 + bob, STONE_LO)
    for x in range(14, 34):
        px(draw, x, 45 + bob, OUTLINE)
        px(draw, x, 54 + bob, OUTLINE)
    for y in range(46 + bob, 54 + bob):
        px(draw, 13, y, OUTLINE)
        px(draw, 34, y, OUTLINE)
    fill_rect(draw, 16, 44 + bob, 31, 45 + bob, STONE_HI)
    for x in range(16, 32):
        px(draw, x, 43 + bob, OUTLINE)


def draw_arrow(draw: ImageDraw.ImageDraw, bob: int, attack: int) -> None:
    wood = (62, 120, 48, 255)
    wood_dk = (40, 82, 32, 255)
    wood_lt = (98, 158, 70, 255)
    string_c = (200, 210, 180, 255)
    tip = (220, 230, 200, 255)
    flash = (255, 255, 160, 255)
    recoil = attack * 2 if attack else 0
    by = bob - recoil
    draw_pedestal(draw, 0)
    fill_rect(draw, 22, 28 + by, 25, 43, wood)
    fill_rect(draw, 22, 28 + by, 23, 43, wood_lt)
    fill_rect(draw, 25, 28 + by, 25, 43, wood_dk)
    for i, (ox, oy) in enumerate([
        (-6, -2), (-8, 2), (-9, 6), (-9, 10), (-8, 14), (-6, 18), (-4, 20),
    ]):
        c = wood_lt if i % 2 == 0 else wood
        fill_rect(draw, 20 + ox, 18 + by + oy, 22 + ox, 19 + by + oy, c)
        px(draw, 19 + ox, 18 + by + oy, OUTLINE)
    for y in range(16 + by, 40 + by):
        px(draw, 21, y, string_c)
    ax = 22 - recoil
    fill_rect(draw, ax - 10, 26 + by, ax + 2, 27 + by, tip)
    px(draw, ax - 11, 26 + by, tip)
    px(draw, ax - 12, 26 + by, tip)
    px(draw, ax - 11, 25 + by, tip)
    px(draw, ax - 11, 27 + by, tip)
    fill_rect(draw, ax, 25 + by, ax + 2, 28 + by, (180, 60, 50, 255))
    if attack >= 1:
        fx, fy = ax - 14, 25 + by
        for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 1)]:
            px(draw, fx + dx, fy + dy, flash if attack < 3 else (255, 200, 80, 200))
    if attack == 2:
        for dx in range(-3, 4):
            px(draw, ax - 16 + dx, 26 + by, (255, 240, 100, 180))


def draw_cannon(draw: ImageDraw.ImageDraw, bob: int, attack: int) -> None:
    body = (180, 100, 45, 255)
    body_dk = (130, 70, 30, 255)
    body_lt = (210, 130, 70, 255)
    metal = (70, 68, 65, 255)
    flash = (255, 200, 60, 255)
    smoke = (180, 180, 180, 160)
    recoil = attack * 3 if attack else 0
    by = bob
    bx = recoil
    draw_pedestal(draw, 0)
    fill_rect(draw, 18, 36 + by, 29, 43, body_dk)
    fill_rect(draw, 19, 36 + by, 28, 37 + by, body_lt)
    fill_rect(draw, 10 + bx, 28 + by, 30 + bx, 34 + by, body)
    fill_rect(draw, 10 + bx, 28 + by, 30 + bx, 29 + by, body_lt)
    fill_rect(draw, 10 + bx, 33 + by, 30 + bx, 34 + by, body_dk)
    fill_rect(draw, 8 + bx, 27 + by, 11 + bx, 35 + by, metal)
    fill_rect(draw, 16 + bx, 27 + by, 17 + bx, 35 + by, body_dk)
    fill_rect(draw, 24 + bx, 27 + by, 25 + bx, 35 + by, body_dk)
    fill_rect(draw, 28 + bx, 26 + by, 33 + bx, 36 + by, body_dk)
    if attack >= 1:
        mx, my = 6 + bx, 30 + by
        for r in range(1, 2 + attack):
            for dx in range(-r, r + 1):
                for dy in range(-r, r + 1):
                    if abs(dx) + abs(dy) <= r + 1:
                        px(draw, mx + dx - 2, my + dy, flash)
        if attack >= 2:
            for dx, dy in [(-4, -2), (-5, 0), (-4, 2), (-6, 1), (-3, -3)]:
                px(draw, mx + dx, my + dy, smoke)


def draw_frost(draw: ImageDraw.ImageDraw, bob: int, attack: int) -> None:
    ice = (80, 200, 220, 255)
    ice_lt = (180, 245, 255, 255)
    ice_dk = (40, 140, 170, 255)
    core = (220, 255, 255, 255)
    flash = (200, 255, 255, 255)
    recoil = attack * 1 if attack else 0
    by = bob - (1 if attack else 0)
    draw_pedestal(draw, 0)
    pts = [
        (20, 40 + by, 27, 42 + by, ice_dk),
        (18, 34 + by, 29, 39 + by, ice),
        (19, 28 + by, 28, 33 + by, ice_lt),
        (21, 22 + by, 26, 27 + by, ice),
        (22, 18 + by, 25, 21 + by, ice_lt),
        (23, 14 + by, 24, 17 + by, core),
    ]
    for x0, y0, x1, y1, c in pts:
        fill_rect(draw, x0, y0, x1, y1, c)
    for y in range(18 + by, 41 + by, 3):
        px(draw, 23, y, ice_lt)
        px(draw, 24, y, ice_dk)
    fill_rect(draw, 14, 30 + by, 17, 36 + by, ice_dk)
    fill_rect(draw, 30, 30 + by, 33, 36 + by, ice_dk)
    fill_rect(draw, 15, 28 + by, 16, 29 + by, ice_lt)
    fill_rect(draw, 31, 28 + by, 32, 29 + by, ice_lt)
    if attack >= 1:
        cx, cy = 23 - recoil, 16 + by
        for dx, dy in [
            (0, -3), (2, -2), (-2, -2), (3, 0), (-3, 0), (2, 2), (-2, 2), (0, 3),
            (4, -1), (-4, -1),
        ]:
            px(draw, cx + dx, cy + dy, flash)
        if attack >= 2:
            fill_rect(draw, cx - 1, cy - 1, cx + 1, cy + 1, core)
            for a in range(8):
                px(draw, cx + (a % 3) - 1, cy - 5 - a // 2, (150, 230, 255, 200))


def draw_sniper(draw: ImageDraw.ImageDraw, bob: int, attack: int) -> None:
    gun = (110, 114, 120, 255)
    gun_dk = (70, 74, 80, 255)
    gun_lt = (150, 154, 160, 255)
    stock = (90, 70, 50, 255)
    scope = (50, 55, 60, 255)
    flash = (255, 240, 180, 255)
    recoil = attack * 4 if attack else 0
    by = bob
    bx = recoil
    draw_pedestal(draw, 0)
    fill_rect(draw, 20, 38 + by, 27, 43, gun_dk)
    fill_rect(draw, 21, 36 + by, 26, 38 + by, gun)
    fill_rect(draw, 4 + bx, 29 + by, 32 + bx, 32 + by, gun)
    fill_rect(draw, 4 + bx, 29 + by, 32 + bx, 29 + by, gun_lt)
    fill_rect(draw, 4 + bx, 32 + by, 32 + bx, 32 + by, gun_dk)
    fill_rect(draw, 2 + bx, 28 + by, 5 + bx, 33 + by, gun_dk)
    fill_rect(draw, 18 + bx, 25 + by, 26 + bx, 28 + by, scope)
    fill_rect(draw, 20 + bx, 24 + by, 24 + bx, 24 + by, gun_lt)
    fill_rect(draw, 30 + bx, 28 + by, 36 + bx, 35 + by, stock)
    fill_rect(draw, 32 + bx, 30 + by, 38 + bx, 34 + by, stock)
    if attack >= 1:
        mx, my = 1 + bx, 30 + by
        for dx in range(0, 3 + attack * 2):
            px(draw, mx - dx, my, flash)
            if dx % 2 == 0:
                px(draw, mx - dx, my - 1, flash)
                px(draw, mx - dx, my + 1, (255, 200, 80, 200))
        if attack >= 2:
            px(draw, mx - 8, my, (255, 255, 255, 220))
            px(draw, mx - 9, my - 1, flash)


def draw_mage(draw: ImageDraw.ImageDraw, bob: int, attack: int) -> None:
    robe = (90, 50, 130, 255)
    robe_lt = (130, 80, 180, 255)
    robe_dk = (55, 30, 85, 255)
    orb = (180, 100, 255, 255)
    orb_core = (240, 200, 255, 255)
    staff = (100, 80, 50, 255)
    flash = (255, 160, 255, 255)
    recoil = attack * 2 if attack else 0
    by = bob - (1 if attack == 2 else 0)
    pulse = attack
    draw_pedestal(draw, 0)
    fill_rect(draw, 18, 32 + by, 29, 43, robe)
    fill_rect(draw, 19, 30 + by, 28, 31 + by, robe_lt)
    fill_rect(draw, 20, 26 + by, 27, 29 + by, robe)
    fill_rect(draw, 20, 22 + by, 27, 25 + by, robe_dk)
    fill_rect(draw, 21, 20 + by, 26, 21 + by, robe)
    fill_rect(draw, 22, 24 + by, 25, 26 + by, (40, 30, 50, 255))
    fill_rect(draw, 30, 24 + by, 32, 42, staff)
    fill_rect(draw, 31, 24 + by, 31, 42, (140, 110, 70, 255))
    ox, oy = 30 - recoil // 2, 18 + by - pulse
    r = 4 + (1 if attack else 0)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                c = orb_core if dx * dx + dy * dy <= 2 else orb
                px(draw, ox + dx, oy + dy, c)
    px(draw, ox - 1, oy - 2, (255, 255, 255, 255))
    if attack >= 1:
        for dx, dy in [
            (0, -6), (4, -4), (-4, -4), (6, 0), (-6, 0), (4, 4), (-4, 4), (0, 6),
            (5, -2), (-5, 2),
        ]:
            px(draw, ox + dx, oy + dy, flash)
        if attack >= 2:
            fill_rect(draw, ox - 2, oy - 2, ox + 2, oy + 2, orb_core)
            for a in range(6):
                px(draw, ox + a - 2, oy - 7 - a // 2, (220, 140, 255, 200))


DRAWERS = {
    "arrow": draw_arrow,
    "cannon": draw_cannon,
    "frost": draw_frost,
    "sniper": draw_sniper,
    "mage": draw_mage,
}


def bake_tower(tower_id: str) -> Path:
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    drawer = DRAWERS[tower_id]
    idle_bobs = [0, -1, 0]
    for fi in range(FRAMES):
        frame = new_frame()
        d = ImageDraw.Draw(frame)
        if fi < 3:
            bob = idle_bobs[fi]
            attack = 0
        else:
            bob = 0
            attack = fi - 2
        drawer(d, bob=bob, attack=attack)
        sheet.paste(frame, (fi * FW, 0), frame)
    out = OUT_DIR / f"{tower_id}.png"
    sheet.save(out, "PNG")
    return out


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for tid in DRAWERS:
        path = bake_tower(tid)
        im = Image.open(path)
        print(f"{path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  mode={im.mode}  bytes={path.stat().st_size}")


if __name__ == "__main__":
    main()
