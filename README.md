# Street Biker

NYC bicycle time trials in the browser. No install, no build step.

**Play:** the hosted build at the link in the repo description.

Three routes: Central Park Loop (golden hour, runners, pedicabs, carriages),
5th Avenue Sprint (night, taxis, buses, red lights, cross traffic), and a random
bike path. Four bikes with different handling, two riders, drift-to-boost,
crosswalk boosts, torches that buy you a slow-motion look at the next crossing,
NPCs that talk as you pass, procedural sound, three cameras.

Controls: arrows / WASD, gas + brake + steer to drift, `G` guide, `C` camera,
`M` sounds, `V` voices, `P` pause, `R` restart.

## Run it locally
Browsers block textures on pages opened straight from disk, so serve the folder:

```
python3 -m http.server 8000
```

then open http://localhost:8000. Any static server works (`npx serve`, VS Code Live Server).

## Layout
```
index.html     markup, loads the scripts in order
css/           styles
src/           game code, one file per system (see docs/ARCHITECTURE.md)
assets/        textures, bike and rider images, menu art
vendor/        Three.js r128
```

## Contributing
See `CONTRIBUTING.md`. The code is MIT. The images are not: see `LICENSE-ASSETS.md`.

## Docs
- `docs/ARCHITECTURE.md` — code map, physics numbers, how to extend
- `CHANGELOG.md`
