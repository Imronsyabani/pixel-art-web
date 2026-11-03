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
```bash
python -m pip install -r requirements-assets.txt
npm install
npm run dev
```

## Verify, test, and build
```bash
npm run assets:generate
npm run assets:validate
npm test
npm run build
```

Generated idle/walk PNG files are ignored by Git and recreated from the committed Phase 2 base spritesheets before the dev server or production build starts.

## URL mode
| URL | Behavior |
| --- | --- |
| `/` | Rintaro only (default) |
| `/?G=boy` | Rintaro only |
| `/?G=girl` | Kaoruko only |
| `/?G=boy&C=true` | Rintaro leads, Kaoruko follows |
| `/?G=girl&C=true` | Kaoruko leads, Rintaro follows |

Only literal `C=true` enables couple mode. Missing or invalid `G` defaults to `boy`.

Append `&demo=true` (or use `?demo=true` without other parameters) to run the Phase 4 movement demonstration. Phase 5 will replace this demonstration with player input controls.

## Character assets and animation
- Rintaro: black hair, plain dark blue T-shirt with white collar, black jeans, black wristwatch, casual white shoes, no bag.
- Kaoruko: teal/turquoise outer layer, white dress, brown flat shoes.
- Sprite frames are 64×64 pixels. Direction rows: down, left, right, up.
- Idle: 4 frames per direction at 3 FPS.
- Walk: 6 frames per direction at 9 FPS.

## Task tracker

### Phase 1 — Foundation
- [x] P1.1 Vite + Phaser + Tailwind project foundation
- [x] P1.2 Responsive logical canvas (960×540, FIT)
- [x] P1.3 URL game-mode parser and tests
- [x] P1.4 Pixelify Sans selected and applied
- [x] P1.5 GitHub Actions test/build workflow

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

### Phase 4 — Movement & Couple Follower
- [x] P4.1 Add delta-time based character movement
- [x] P4.2 Normalize diagonal movement speed and apply world bounds
- [x] P4.3 Add direction-aware idle/walk state switching
- [x] P4.4 Record leader movement as a sampled path
- [x] P4.5 Make the follower trace the leader path with a fixed trail distance
- [x] P4.6 Preserve leader/follower order for both URL modes
- [x] P4.7 Add optional movement demonstration mode
- [x] P4.8 Add unit tests for movement and follower path logic
- [ ] P4.9 Verify the demo visually in a local browser

### Roadmap
- Phase 5: Keyboard and mobile/tablet virtual joystick
- Phase 6: Top-down Cliff Garden map and modular environment assets
- Phase 7: Collision, camera, and map boundaries
- Phase 8: Ambient ocean, flower, leaf, and petal animations
- Phase 9: Responsive UI, audio, and performance polish

Keyboard/touch controls are intentionally reserved for Phase 5. The Phase 4 movement demo exercises the movement and follower engine without hardwiring a temporary input system.
