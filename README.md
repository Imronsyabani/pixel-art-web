# Cliff Garden

A responsive pixel-art exploration game set in a peaceful cliffside flower garden.

## Stack
- JavaScript ES modules
- Phaser 3
- Vite
- Tailwind CSS 4
- Pixelify Sans
- Python + Pillow for reproducible pixel sprite generation

## Run locally
Install the asset-generation dependency once, then start the Vite server. The predev script generates the animation sheets automatically.
```bash
python -m pip install -r requirements-assets.txt
npm install
npm run dev
```

## Regenerate, validate, test, and build
```bash
npm run assets:generate
npm run assets:validate
npm test
npm run build
```

Generated idle/walk PNG files are intentionally ignored by Git; they are recreated from the committed Phase 2 base spritesheets whenever the dev server or production build starts.

## URL mode
| URL | Behavior |
| --- | --- |
| `/` | Rintaro only (default) |
| `/?G=boy` | Rintaro only |
| `/?G=girl` | Kaoruko only |
| `/?G=boy&C=true` | Rintaro leads, Kaoruko follows |
| `/?G=girl&C=true` | Kaoruko leads, Rintaro follows |

Only literal `C=true` enables couple mode. Missing or invalid `G` defaults to `boy`.

## Character direction and assets
- Rintaro: black hair, plain dark blue T-shirt with white collar, black jeans, black wristwatch, casual white shoes, no bag.
- Kaoruko: teal/turquoise outer layer, white dress, brown flat shoes.
- Couple mode: the character selected by `G` leads.

Each character uses transparent PNG sprite sheets with 64×64 frames. Rows are ordered `down`, `left`, `right`, `up`; frames are ordered left-to-right within each row.

| Sheet | Grid | Animation |
| --- | --- | --- |
| `idle.png` | 4 columns × 4 rows | 4 idle frames per direction, 3 FPS |
| `walk.png` | 6 columns × 4 rows | 6 walk frames per direction, 9 FPS |

The source generator is `scripts/generate_character_animations.py`; it derives idle/walk sheets from each approved Phase 2 base spritesheet. The exported layout is documented in `public/assets/characters/manifest.json`.

## Task tracker
### Phase 1 — Foundation
- [x] Vite + Phaser + Tailwind project foundation
- [x] Responsive logical canvas (960×540, FIT)
- [x] URL game-mode parser and tests
- [x] Pixelify Sans selected and applied
- [x] GitHub Actions test/build workflow

### Phase 2 — Character Asset Pipeline
- [x] P2.1 Define 64×64 frame contract and direction ordering
- [x] P2.2 Create Rintaro four-direction base spritesheet
- [x] P2.3 Create Kaoruko four-direction base spritesheet
- [x] P2.4 Add asset manifest and Phaser preload helper
- [x] P2.5 Add reusable CharacterFactory
- [x] P2.6 Show selected character(s) based on URL mode
- [x] P2.7 Add asset dimension validation and automated tests
- [ ] P2.8 Verify sprite appearance in local browser at desktop/mobile sizes

### Phase 3 — Four-direction Animation
- [x] P3.1 Generate four-direction idle sheets for both characters
- [x] P3.2 Generate four-direction walk sheets for both characters
- [x] P3.3 Register looping Phaser animations for all directions
- [x] P3.4 Add animation-state switching API to CharacterFactory
- [x] P3.5 Preview idle/walk states through the current URL mode
- [x] P3.6 Validate PNG dimensions and transparent sprite-sheet layout
- [x] P3.7 Add automated animation mapping tests
- [ ] P3.8 Verify animation timing and visual quality in local browser

### Roadmap
- Phase 4: Character movement and couple follower behavior
- Phase 5: Keyboard and mobile/tablet virtual joystick
- Phase 6: Top-down Cliff Garden map and modular environment assets
- Phase 7: Collision, camera, and map boundaries
- Phase 8: Ambient ocean, flower, leaf, and petal animations
- Phase 9: Responsive UI, audio, and performance polish

Movement input, collisions, and follower behavior are intentionally scheduled for Phase 4 and later.
