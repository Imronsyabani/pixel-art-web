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

## Test and build
```bash
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

## Character direction
- Rintaro: black hair, plain dark blue T-shirt with white collar, black jeans, black wristwatch, casual white shoes, no bag.
- Kaoruko: teal/turquoise outer layer, white dress, brown flat shoes.
- Couple mode: the character selected by `G` leads.

## Task tracker
### Phase 1 — Foundation
- [x] Vite project initialized
- [x] Phaser and Tailwind installed in project configuration
- [x] Responsive logical canvas (960×540, FIT)
- [x] URL game-mode parser
- [x] URL-mode automated tests
- [x] Pixelify Sans selected as primary font
- [ ] Verify rendering in target browsers/devices
- [ ] Verify local production build

### Roadmap
- Phase 2: Character asset pipeline
- Phase 3: Four-direction idle/walk animations
- Phase 4: Single/couple movement and follower behavior
- Phase 5: Keyboard and mobile/tablet virtual joystick
- Phase 6: Top-down Cliff Garden map and modular environment assets
- Phase 7: Collision, camera, and map boundaries
- Phase 8: Ambient ocean, flower, leaf, and petal animations
- Phase 9: Responsive UI, audio, and performance polish

The current scene is a boot placeholder. Character sprites, map art, gameplay movement, and joystick are intentionally scheduled for later phases.
