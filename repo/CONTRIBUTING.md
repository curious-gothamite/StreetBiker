# Contributing

Thanks for looking. This is one HTML file on purpose: open `index.html`, edit,
refresh. No build, no npm.

## Good first contributions
- Tune a number and say why (steering, drift, camera, boost). All tunables are
  at the top of the script: `BIKES`, `RIDERS`, `TRACKS`, `LINES`.
- Add overheard lines to `LINES` (park: casual NYC; fifth: rent, rates, deals).
- A new track: add to `TRACKS` with waypoints. See `docs/ARCHITECTURE.md`.
- Performance on lower-end laptops and phones.
- Real 3D models (glTF) for bikes, riders, cars, the carriage, the food cart.
  This is the biggest visual step and it needs a `models/` folder plus
  `GLTFLoader`. Open an issue first so we agree the layout.
- Seamless versions of the textures.

## Rules
- Keep it playable from a double-click on `index.html`.
- Don't add trackers, ads, or network calls.
- Don't add images you don't have the rights to. Google Maps / Street View
  captures are not allowed. AI-generated textures are fine if you say so.
- Media you add is licensed under `LICENSE-ASSETS.md` unless you state otherwise
  in the PR.
- One change per pull request, with a sentence on what it does and a
  screenshot or clip if it's visual.

## Reporting
Bugs and feedback go in Issues. Include browser, OS, GPU if you know it, and
which track and bike.
