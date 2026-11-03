# Cliff Garden

A responsive pixel-art exploration game set in a peaceful cliffside flower garden.

## Stack
- JavaScript ES modules
- Phaser 3 tilemaps
- Vite
- Tailwind CSS 4
- Pixelify Sans
- Python + Pillow for reproducible character sprite generation

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

## URL mode
| URL | Behavior |
| --- | --- |
| `/` | Rintaro only (default) |
| `/?G=boy` | Rintaro only |
| `/?G=girl` | Kaoruko only |
| `/?G=boy&C=true` | Rintaro leads, Kaoruko follows |
| `/?G=girl&C=true` | Kaoruko leads, Rintaro follows |

Only literal `C=true` enables couple mode. Missing or invalid `G` defaults to `boy`.

## Controls
- Desktop: WASD or arrow keys.
- Mobile/tablet: drag the semi-transparent virtual joystick at the bottom-left.
- Only the leader receives player input. In couple mode the follower traces the leader's path automatically.
- `?touch=true` forces joystick UI for desktop preview; `?touch=false` hides it on touch-capable devices.
- `?demo=true` runs the optional automatic movement demo.

## World and character assets
- The garden is a 72×48 tile world with 32×32 tiles.
- The sea surrounds the island; a sandy beach, cliff rim and winding stone path connect the garden to a lookout.
- A large central tree is surrounded by flower beds; blue flowers are the dominant color.
- Benches, rocks, shrubs and a fence add landmarks.
- Character frames are 64×64 pixels. Direction rows: down, left, right, up.
- Idle: 4 frames per direction at 3 FPS. Walk: 6 frames per direction at 9 FPS.

The map atlas is generated procedurally in Phaser from pixel-sized rectangles. Its layout logic is in `src/game/map/gardenLayout.js`; rendering and prop textures are in `src/game/map/GardenMap.js`.

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

### Phase 5 — Input Controls
- [x] P5.1 Add WASD and arrow-key movement input
- [x] P5.2 Add analog virtual joystick with deadzone and clamped radius
- [x] P5.3 Show joystick only on touch devices by default
- [x] P5.4 Add URL overrides to preview/hide touch controls
- [x] P5.5 Connect input only to the leader and preserve follower behavior
- [x] P5.6 Add keyboard, analog vector, and pointer interaction tests
- [ ] P5.7 Verify keyboard and joystick interaction in local browsers/devices

### Phase 6 — Cliff Garden Map
- [x] P6.1 Build a deterministic 72×48 tile layout
- [x] P6.2 Add sea, beach, cliff rim and grass ground tiles
- [x] P6.3 Add a winding stone path and beach branch
- [x] P6.4 Add a large central tree and blue-dominant flower beds
- [x] P6.5 Add decorative props: bench, rocks, shrubs and fence
- [x] P6.6 Integrate map tile layers into Phaser
- [x] P6.7 Move player spawn and camera follow into the larger world
- [x] P6.8 Add deterministic layout tests for key map features
- [ ] P6.9 Verify map composition and camera behavior in local browser

### Roadmap
- Phase 7: Collision, camera bounds polish and map boundaries
- Phase 8: Ambient ocean, flower, leaf and petal animations
- Phase 9: Responsive UI, audio and performance polish

Shoreline, cliff-edge and prop collision are deliberately reserved for Phase 7. Phase 6 constrains movement to the map's world rectangle but does not yet prevent walking through scenery or into water.
