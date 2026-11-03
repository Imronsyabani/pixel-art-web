"""Generate transparent four-direction idle and walk sprite sheets.

The project uses 64x64 frames. Rows are down, left, right, up.
Idle sheets: 4 columns x 4 rows. Walk sheets: 6 columns x 4 rows.
The approved Phase 2 directional base sheets are the source for all generated frames.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets" / "characters"
FRAME = 64
DIRECTIONS = ("down", "left", "right", "up")
IDLE_OFFSETS = (0, -1, 0, -1)
WALK_STRIDE = (-3, -2, 0, 2, 3, 0)
WALK_LIFT = (0, 1, 2, 1, 0, 1)
WALK_BOB = (0, -1, 0, -1, 0, 1)

COLORS = {
    "outline": "#252333",
    "skin": "#f2c5a6",
    "shoe_white": "#f3f4f0",
    "shoe_shadow": "#a7b5b4",
    "black": "#171a24",
    "brown": "#80533d",
    "brown_light": "#b47b54",
    "shadow": (70, 84, 90, 90),
}


def shifted(base: Image.Image, dy: int) -> Image.Image:
    frame = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
    frame.alpha_composite(base, (0, dy))
    return frame


def load_base_character(character_id: str) -> dict[str, Image.Image]:
    source = ASSET_ROOT / character_id / "spritesheet.png"
    sheet = Image.open(source).convert("RGBA")
    expected = (FRAME * len(DIRECTIONS), FRAME)
    if sheet.size != expected:
        raise ValueError(f"{character_id} base sheet must be {expected}, got {sheet.size}")
    return {
        direction: sheet.crop((index * FRAME, 0, (index + 1) * FRAME, FRAME))
        for index, direction in enumerate(DIRECTIONS)
    }


def make_idle_sheet(base_frames: dict[str, Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME * 4, FRAME * 4), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        base = base_frames[direction]
        for column, offset in enumerate(IDLE_OFFSETS):
            frame = shifted(base, offset)
            sheet.alpha_composite(frame, (column * FRAME, row * FRAME))
    return sheet


def draw_rintaro_walk_frame(base: Image.Image, frame_index: int) -> Image.Image:
    bob = WALK_BOB[frame_index]
    frame = shifted(base, bob)
    draw = ImageDraw.Draw(frame)

    # Replace the feet/shadow area with alternating lower-leg poses. Upper body,
    # wristwatch, collar and hair remain identical to the approved Phase 2 design.
    draw.rectangle((16, 44, 48, 63), fill=(0, 0, 0, 0))
    stride = WALK_STRIDE[frame_index]
    left_lift = WALK_LIFT[frame_index]
    right_lift = WALK_LIFT[(frame_index + 3) % len(WALK_LIFT)]

    draw.ellipse((17, 56, 47, 61), fill=COLORS["shadow"])
    legs = ((22 + stride, left_lift), (36 - stride, right_lift))
    for x, lift in legs:
        draw.rectangle((x + 1, 42 + lift, x + 7, 51 + lift), fill=COLORS["outline"])
        draw.rectangle((x + 2, 43 + lift, x + 6, 50 + lift), fill=COLORS["black"])
        draw.rectangle((x, 50 + lift, x + 9, 55 + lift), fill=COLORS["outline"])
        draw.rectangle((x + 1, 51 + lift, x + 8, 53 + lift), fill=COLORS["shoe_white"])
        draw.rectangle((x + 2, 54 + lift, x + 8, 55 + lift), fill=COLORS["shoe_shadow"])
    return frame


def draw_kaoruko_walk_frame(base: Image.Image, frame_index: int) -> Image.Image:
    bob = WALK_BOB[frame_index]
    frame = shifted(base, bob)
    draw = ImageDraw.Draw(frame)

    # Keep the white dress and teal outer layer intact; animate only the legs,
    # brown flat shoes and ground shadow below the dress hem.
    draw.rectangle((16, 47, 48, 63), fill=(0, 0, 0, 0))
    stride = WALK_STRIDE[frame_index]
    left_lift = WALK_LIFT[frame_index]
    right_lift = WALK_LIFT[(frame_index + 3) % len(WALK_LIFT)]

    draw.ellipse((18, 57, 46, 61), fill=COLORS["shadow"])
    legs = ((23 + stride, left_lift), (36 - stride, right_lift))
    for x, lift in legs:
        draw.rectangle((x + 2, 45 + lift, x + 6, 52 + lift), fill=COLORS["outline"])
        draw.rectangle((x + 3, 46 + lift, x + 5, 51 + lift), fill=COLORS["skin"])
        draw.rectangle((x, 51 + lift, x + 8, 55 + lift), fill=COLORS["outline"])
        draw.rectangle((x + 1, 52 + lift, x + 7, 54 + lift), fill=COLORS["brown"])
        draw.rectangle((x + 2, 54 + lift, x + 7, 55 + lift), fill=COLORS["brown_light"])
    return frame


def make_walk_sheet(base_frames: dict[str, Image.Image], draw_walk_frame) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME * 6, FRAME * 4), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for column in range(6):
            frame = draw_walk_frame(base_frames[direction], column)
            sheet.alpha_composite(frame, (column * FRAME, row * FRAME))
    return sheet


def save_character(character_id: str, draw_walk_frame) -> None:
    target = ASSET_ROOT / character_id
    target.mkdir(parents=True, exist_ok=True)
    base_frames = load_base_character(character_id)
    idle = make_idle_sheet(base_frames)
    walk = make_walk_sheet(base_frames, draw_walk_frame)
    idle.save(target / "idle.png", optimize=True)
    walk.save(target / "walk.png", optimize=True)
    print(f"Generated {character_id}: idle={idle.size}, walk={walk.size}")


if __name__ == "__main__":
    save_character("rintaro", draw_rintaro_walk_frame)
    save_character("kaoruko", draw_kaoruko_walk_frame)
