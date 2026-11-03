# Cliff Garden

A responsive pixel-art exploration game set in a peaceful cliffside flower garden.

## Stack
- JavaScript ES modules
- Phaser 3
- Vite
- Tailwind CSS 4
- Pixelify Sans

## Run locally
```bash
npm install
npm run dev
```

## Verify assets, test, and build
```bash
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

## Character direction and assets
- Rintaro: black hair, plain dark blue T-shirt with white collar, black jeans, black wristwatch, casual white shoes, no bag.
- Kaoruko: teal/turquoise outer layer, white dress, brown flat shoes.
- Couple mode: the character selected by `G` leads.

Each character spritesheet is a transparent PNG, one horizontal row of four 64×64 frames. Frame order is `down`, `left`, `right`, `up`. The source contract is in `src/game/assets/characterAssets.js`; `public/assets/characters/manifest.json` documents the exported image format.

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

### Roadmap
- Phase 3: Four-direction idle/walk animations
- Phase 4: Single/couple movement and follower behavior
- Phase 5: Keyboard and mobile/tablet virtual joystick
- Phase 6: Top-down Cliff Garden map and modular environment assets
- Phase 7: Collision, camera, and map boundaries
- Phase 8: Ambient ocean, flower, leaf, and petal animations
- Phase 9: Responsive UI, audio, and performance polish

Phase 2 deliberately supplies static directional frames. Animated idle/walk cycles and player movement are scheduled for later phases.
