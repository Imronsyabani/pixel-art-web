# Cliff Garden

A responsive pixel-art exploration game set in a peaceful cliffside flower garden.

## Stack
- JavaScript ES modules
- Phaser 3 tilemaps
- Vite, Tailwind CSS 4, Pixelify Sans
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
|---|---|
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
- Garden is a 72×48 tile world with 32×32 tiles.
- Sea, sand, cliff rim, grass, winding stone path, central tree and blue-dominant flower beds.
- Benches, rocks, shrubs and fence add landmarks.
- Character frames are 64×64 pixels; direction rows: down, left, right, up.
- Idle: 4 frames per direction at 3 FPS. Walk: 6 frames per direction at 9 FPS.

## Collision rules
- Grass, stone path and dry sand are walkable.
- Ocean, wet sand and cliff rim are blocked.
- Shrubs, rocks, fence, central tree trunk, bench and lookout rocks block character movement.
- Characters have a circular collision footprint. Movement uses swept substeps and wall sliding.
- Follower advances along sampled leader trail segments instead of cutting across corners.

## Ambient environment
- A small set of ocean glints pulse and drift over water tiles.
- Selected flowers sway gently with varied timing and amplitude.
- Pixel leaves move subtly across the central tree canopy.
- Lightweight petals float across the world and wrap at the map edges.
- Ambient sprites are deterministic, bounded in count, and explicitly cleaned up when the scene shuts down.

## Task tracker

### Phase 1 — Foundation
- [x] P1.1 Vite + Phaser + Tailwind project
- [x] P1.2 Responsive canvas and URL mode parser
- [x] P1.3 Tests, Pixelify Sans and GitHub Actions

### Phase 2 — Character Asset Pipeline
- [x] P2.1 64×64 directional frame contract
- [x] P2.2 Rintaro and Kaoruko base spritesheets
- [x] P2.3 Asset manifest, loader, factory and tests
- [ ] P2.4 Verify sprites in local browser/device

### Phase 3 — Four-direction Animation
- [x] P3.1 Idle and walk sheets for both characters
- [x] P3.2 Register looping Phaser animations for four directions
- [x] P3.3 Animation-state switching and mapping tests
- [ ] P3.4 Verify animation quality in local browser

### Phase 4 — Movement & Couple Follower
- [x] P4.1 Delta-time movement and normalized diagonal speed
- [x] P4.2 Sample leader route and follower system
- [x] P4.3 Movement and follower tests
- [ ] P4.4 Verify demo visually in local browser

### Phase 5 — Input Controls
- [x] P5.1 WASD/arrow-key movement
- [x] P5.2 Analog virtual joystick, deadzone and pointer handling
- [x] P5.3 Input vector and joystick tests
- [ ] P5.4 Verify controls on desktop and physical touch device

### Phase 6 — Cliff Garden Map
- [x] P6.1 72×48 tile layout and ground/decor layers
- [x] P6.2 Sea, beach, cliff, path and grass tiles
- [x] P6.3 Central tree and blue-dominant flower beds
- [x] P6.4 Props, spawn and camera follow
- [ ] P6.5 Verify map composition in local browser

### Phase 7 — Collision & World Boundaries
- [x] P7.1 Define walkable and blocked tiles
- [x] P7.2 Add character-radius collision against tiles and props
- [x] P7.3 Add swept movement substeps and wall sliding
- [x] P7.4 Make leader movement collision-safe
- [x] P7.5 Make follower advance along sampled trail waypoints
- [x] P7.6 Add collision and follower tests
- [ ] P7.7 Verify collision feel and camera edges in local browser

### Phase 8 — Ambient Environment
- [x] P8.1 Add subtle animated ocean highlights
- [x] P8.2 Add gentle flower sway with varied phases
- [x] P8.3 Add moving leaves on the central tree canopy
- [x] P8.4 Add floating petals with world-edge wrapping
- [x] P8.5 Keep ambient object counts bounded and clean them up on scene shutdown
- [x] P8.6 Add deterministic ambient motion tests
- [ ] P8.7 Verify visual quality and performance in local browser/device

### Roadmap
- Phase 9: Responsive UI, audio and optimization

Keyboard/touch input and screen-space joystick remain unchanged. Phase 7 collision feel and Phase 8 ambient visuals still require local browser/device verification.
