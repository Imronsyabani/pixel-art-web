"""Generate aligned four-direction pixel character animations.

All generated frames are 64x64. The idle pose uses the same neutral lower-body
silhouette as walk frames 0 and 3, so changing animation state does not change
leg length, shoe size, or ground contact. Front-facing facial pixels are mirrored
for a balanced expression and the torso is narrowed without shrinking the head.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets" / "characters"
FRAME = 64
DIRECTIONS = ("down", "left", "right", "up")

# Neutral poses at frames 0 and 3 match idle exactly.
WALK_STRIDE = (0, 2, 3, 0, -2, -3)
WALK_LIFT = (0, 1, 2, 0, 1, 2)
WALK_BOB = (0, -1, 0, 0, -1, 0)
IDLE_BOB = (0, -1, 0, -1)

COLORS = {
    "outline": "#252333",
    "skin": "#f2c5a6",
    "skin_shadow": "#d8947c",
    "shoe_white": "#f3f4f0",
    "shoe_shadow": "#a7b5b4",
    "black": "#171a24",
    "brown": "#80533d",
    "brown_light": "#b47b54",
    "shadow": (48, 67, 57, 105),
}


def shifted(base: Image.Image, dy: int) -> Image.Image:
    frame = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
    frame.alpha_composite(base, (0, dy))
    return frame


def slim_body(base: Image.Image) -> Image.Image:
    """Narrow only the lower silhouette; preserve the original head pixel size."""
    result = base.copy()
    body = base.crop((0, 32, FRAME, FRAME))
    narrow_width = 56
    body = body.resize((narrow_width, FRAME - 32), Image.Resampling.NEAREST)
    result.paste((0, 0, 0, 0), (0, 32, FRAME, FRAME))
    result.alpha_composite(body, ((FRAME - narrow_width) // 2, 32))
    return result


def balance_front_face(frame: Image.Image, character_id: str) -> Image.Image:
    """Mirror only the front-facing facial area across the exact center line."""
    result = frame.copy()
    half_width = 12 if character_id == "kaoruko" else 14
    top, bottom = 21, 32
    left = result.crop((32 - half_width, top, 32, bottom))
    result.paste(left.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (32, top))
    return result


def prepare_base_character(character_id: str) -> dict[str, Image.Image]:
    source = ASSET_ROOT / character_id / "spritesheet.png"
    sheet = Image.open(source).convert("RGBA")
    expected = (FRAME * len(DIRECTIONS), FRAME)
    if sheet.size != expected:
        raise ValueError(f"{character_id} base sheet must be {expected}, got {sheet.size}")

    frames = {}
    for index, direction in enumerate(DIRECTIONS):
        frame = slim_body(sheet.crop((index * FRAME, 0, (index + 1) * FRAME, FRAME)))
        if direction == "down":
            frame = balance_front_face(frame, character_id)
        frames[direction] = frame
    return frames


def draw_shadow(draw: ImageDraw.ImageDraw, left: int, right: int, y: int) -> None:
    draw.ellipse((left, y, right, y + 5), fill=COLORS["shadow"])


def draw_rintaro_legs(draw: ImageDraw.ImageDraw, frame_index: int, bob: int) -> None:
    stride = WALK_STRIDE[frame_index]
    left_lift = WALK_LIFT[frame_index]
    right_lift = WALK_LIFT[(frame_index + 3) % len(WALK_LIFT)]
    draw_shadow(draw, 18, 46, 57 + bob)

    for x, lift in ((22 + stride, left_lift), (36 - stride, right_lift)):
        top = 35 + lift + bob
        draw.rectangle((x + 1, top, x + 6, 51 + lift + bob), fill=COLORS["outline"])
        draw.rectangle((x + 2, top + 1, x + 5, 50 + lift + bob), fill=COLORS["black"])
        draw.rectangle((x, 50 + lift + bob, x + 8, 55 + lift + bob), fill=COLORS["outline"])
        draw.rectangle((x + 1, 51 + lift + bob, x + 7, 53 + lift + bob), fill=COLORS["shoe_white"])
        draw.rectangle((x + 2, 54 + lift + bob, x + 7, 55 + lift + bob), fill=COLORS["shoe_shadow"])


def draw_kaoruko_legs(draw: ImageDraw.ImageDraw, frame_index: int, bob: int) -> None:
    stride = WALK_STRIDE[frame_index]
    left_lift = WALK_LIFT[frame_index]
    right_lift = WALK_LIFT[(frame_index + 3) % len(WALK_LIFT)]
    draw_shadow(draw, 19, 45, 58 + bob)

    for x, lift in ((23 + stride, left_lift), (36 - stride, right_lift)):
        top = 42 + lift + bob
        draw.rectangle((x + 2, top, x + 5, 52 + lift + bob), fill=COLORS["outline"])
        draw.rectangle((x + 3, top + 1, x + 4, 51 + lift + bob), fill=COLORS["skin"])
        draw.rectangle((x, 51 + lift + bob, x + 8, 55 + lift + bob), fill=COLORS["outline"])
        draw.rectangle((x + 1, 52 + lift + bob, x + 7, 54 + lift + bob), fill=COLORS["brown"])
        draw.rectangle((x + 2, 54 + lift + bob, x + 6, 55 + lift + bob), fill=COLORS["brown_light"])


def draw_back_shoes(draw: ImageDraw.ImageDraw, character_id: str, frame_index: int, bob: int) -> None:
    stride = WALK_STRIDE[frame_index]
    lift_a = WALK_LIFT[frame_index]
    lift_b = WALK_LIFT[(frame_index + 3) % len(WALK_LIFT)]
    draw_shadow(draw, 19, 45, 58 + bob)

    for x, lift in ((22 + stride, lift_a), (36 - stride, lift_b)):
        if character_id == "kaoruko":
            draw.rectangle((x, 53 + lift + bob, x + 8, 57 + lift + bob), fill=COLORS["outline"])
            draw.rectangle((x + 1, 54 + lift + bob, x + 7, 56 + lift + bob), fill=COLORS["brown"])
        else:
            draw.rectangle((x, 52 + lift + bob, x + 8, 57 + lift + bob), fill=COLORS["outline"])
            draw.rectangle((x + 1, 53 + lift + bob, x + 7, 55 + lift + bob), fill=COLORS["shoe_white"])
            draw.rectangle((x + 2, 56 + lift + bob, x + 7, 57 + lift + bob), fill=COLORS["shoe_shadow"])


def render_pose(base: Image.Image, character_id: str, direction: str, frame_index: int, idle: bool) -> Image.Image:
    bob = IDLE_BOB[frame_index] if idle else WALK_BOB[frame_index]
    pose_index = 0 if idle else frame_index
    frame = shifted(base, bob)
    draw = ImageDraw.Draw(frame)

    if direction == "up":
        # Preserve the back hair and outfit; only the shoes are animated.
        draw.rectangle((18, 52, 46, 63), fill=(0, 0, 0, 0))
        draw_back_shoes(draw, character_id, pose_index, bob)
    elif character_id == "rintaro":
        draw.rectangle((15, 34, 49, 63), fill=(0, 0, 0, 0))
        draw_rintaro_legs(draw, pose_index, bob)
    else:
        draw.rectangle((16, 41, 48, 63), fill=(0, 0, 0, 0))
        draw_kaoruko_legs(draw, pose_index, bob)

    return frame


def make_idle_sheet(base_frames: dict[str, Image.Image], character_id: str) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME * 4, FRAME * 4), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for column in range(4):
            frame = render_pose(base_frames[direction], character_id, direction, column, True)
            sheet.alpha_composite(frame, (column * FRAME, row * FRAME))
    return sheet


def make_walk_sheet(base_frames: dict[str, Image.Image], character_id: str) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME * 6, FRAME * 4), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for column in range(6):
            frame = render_pose(base_frames[direction], character_id, direction, column, False)
            sheet.alpha_composite(frame, (column * FRAME, row * FRAME))
    return sheet


def save_character(character_id: str) -> None:
    target = ASSET_ROOT / character_id
    target.mkdir(parents=True, exist_ok=True)
    base_frames = prepare_base_character(character_id)
    idle = make_idle_sheet(base_frames, character_id)
    walk = make_walk_sheet(base_frames, character_id)
    idle.save(target / "idle.png", optimize=True)
    walk.save(target / "walk.png", optimize=True)
    print(f"Generated {character_id}: idle={idle.size}, walk={walk.size}")


if __name__ == "__main__":
    save_character("rintaro")
    save_character("kaoruko")
