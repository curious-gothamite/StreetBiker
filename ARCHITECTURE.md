# Street Biker — handoff brief (v0.13)

## 1. The game in one paragraph

NYC time trials on a bicycle. Simple controls (gas, brake/reverse, steer) with one skill mechanic: drift through corners and release for a boost. Small boosts come from riding crosswalk stripes (bigger when pedestrians are on them) and drafting behind traffic. Three tracks, four bikes with different handling, two riders. NPCs move at their own pace and talk; you catch the end of their sentence as you pass. Time trial only: beat the track record.

Look targets are in `reference/renders/`: golden-hour Central Park with long shadows and a green guide ribbon; wet neon 5th Avenue at night.

## 2. Features shipped

**Tracks**
- Central Park Loop: proportional to the real park (CPW x=0 to 5th x=420 before a 0.74 scale; 40 units per block south from 86th). Landmarks: reservoir, Great Lawn, the Lake, Sheep Meadow, the Mall, Bethesda, the Pond, the Met, San Remo towers on CPW, Midtown skyline beyond 59th. Gold-chevron paths and curbs, iron fence, lamp posts, hairpin fences.
- 5th Avenue Sprint: 96th–51st, 45 blocks of 36 units, night. Park on the right until 59th, then the Midtown canyon. Traffic lights on a progressive cycle; on red, 1–3 cross-street cars come through in a platoon; pedestrians gather at the curb on green and cross on red. Double-head lamps with streaks on the wet road, lit storefronts, barricades, red bus lane with "BUS ONLY", food carts with vendors on corners.
- Random Bike Path: 11–14 random waypoints, closed loop, park dressing.

**Bikes** (from the owner's photos, images on the selector): Red Road Bike (balanced), Electric Citi Bike (1.3× accel, lower top, less drift), Neon Fixie (fastest, loosest), Lime E-Bike (strong pull, slow steer). Riders Joe and Susie, any bike.

**Rider rig**: torso, head, hair, crossbody bag, arms to the grips, legs with two-bone IK pedalling driven by speed. NPC cyclists use the same rig.

**Cameras**: rider (low, behind, photo-6 composition), wide chase, cinematic (trackside pan / low dolly / front reverse, cutting every 4–7 s). At red lights on 5th the camera swivels toward the side the cross traffic comes from; a short slow-mo and slight wide-angle fires when a cross car interjects.

**Traffic and NPCs**: park — commuter cyclists (black hybrid), mixed road/fixie/Citi riders, runners with a run cycle, red pedicabs with passengers, horse carriages; 5th — taxis, black SUVs, red/gold/white sedans, MTA buses (livery texture), cross-street cars, food carts; both — sidewalk walkers (coats and totes on 5th), crosswalk pedestrians. Vehicles queue at red lights and behind slower vehicles. Collisions cost speed.

**Chatter**: pass within ~3 m of anyone, or someone ahead speaks every few seconds. Translucent bubble + browser speech synthesis, one line at a time, bubble lasts as long as the voice. Pools: `park`, `fifth` (rent, rates, deals), `driver`, `biker`, `bus`.

**Sound**: all Web Audio, no files. Park: wind gusts, leaves, birds, murmur. 5th: traffic bed, Doppler engine hums on the 5 nearest vehicles, honks, bus horns, tyre squeals, passing ambulance. Bike: rolling, drift squeal, boost whoosh, hit thud, crosswalk chime. SFX and Voices toggle separately.

**Guide**: additive green/yellow/red ribbon on an approximate racing line; red ahead of red lights on 5th.

**Rendering**: Three.js r128, real-time shadows from a sun that follows the player (low in the park for long shadows), ACES tone mapping, sRGB, photo textures mirror-tiled, leaf-card trees with alpha shadows, sky panorama (park) / gradient with horizon glow (night), speed vignette.

## 3. Code map

No build step. `index.html` holds the markup and loads plain `<script>` files in order; they share one global scope, so a file can use anything defined in a file loaded before it (and anything at all from inside functions, which run later).

```
index.html            markup + load order
css/base.css          HUD, overlays, touch controls
css/menu.css          garage menu
vendor/three.r128.min.js
src/
  core.js             renderer, camera, resize, $(), rnd(), pick()
  assets.js           ASSETS, BIKE_IMG, RIDER_IMG, FENDER_TEX: paths into assets/
  data.js             BIKES, RIDERS, TRACKS, LINES: all tunable data
  textures.js         load(), makeTextures(), procedural canvas textures
  track.js            buildTrack(), nearest(), posOnTrack()
  world.js            ribbon(), building(), makeTrees(), skyDome(), flat(), ellipse(), buildWorld()
  models.js           bikeMesh(), carMesh(), runnerMesh(), pedicabMesh(), horseMesh(), cartMesh()
  traffic.js          KIND, dress(), makeTraffic()
  audio.js            AU, audio*, honk/siren/bird/sfx*, say(), setSound(), setVoice()
  chatter.js          speak(), updateBubbles(), clearBubbles()
  render.js           post-processing pass, environment map, enhanceWorld(), lamp/torch/polish ticks
  game.js             start(), finish(), toMenu(), togglePause(), update() (physics, traffic, camera, HUD), loop()
  input.js            keyboard + touch
  menu.js             garage menu, records, HUD buttons
  main.js             ?qa hook, first frame (loaded last)
assets/
  textures/           road, grass, stone, brick, glass, sky, skyline, bus, fence, canopy, fender
  bikes/  riders/     selector images
  ui/                 menu background art
```

Add a new file by putting a `<script src>` tag for it in `index.html` before any file that calls it at load time.

Physics (per second): top speed 27 × bike multiplier, accel 13, brake 24, coast drag 0.12, drive drag 0.45, off-path drag 2.2. Steering 2.3 rad/s × grip (grip ramps in over the first 6 u/s). Drift: lateral damping drops from e^-11 to e^-1.6; charge tiers at 0.5 / 1.2 / 2.1 s give boosts of 0.6 / 1.1 / 1.7 s at 1.4× top speed.

## 4. How to extend

- **Chatter**: append strings to the arrays in `LINES`. Start with "…" to read as a sentence tail.
- **Track**: add to `TRACKS` with `pts` (waypoints in x/z), `width`, `theme`, `traffic`, `crossEvery`, `walkers`. Closed loops use `closed:true`.
- **Texture swap**: replace the image file in `assets/textures/` (same name), or point `ASSETS[key]` in `src/assets.js` at a new file.
- **Bike**: copy an entry in `BIKES`; `style` is one of `road | hybrid | fixie | citi | lime`.

## 5. Next steps, ranked by visual payoff

1. **glTF models** for bikes, riders, vehicles, horse carriage, food cart. The concept renders in `reference/` are the briefs. A-pose rider renders convert well through image-to-3D tools (Meshy, Tripo, Rodin); bikes convert badly from a single view and are better modelled by hand. Loading needs `GLTFLoader` and a folder.
2. **Post-processing**: bloom on the night lights, SSAO under trees, motion blur at speed. Needs Three.js `EffectComposer`, also a folder.
3. **Seamless textures**: the current tiles are mirrored to hide seams; proper seamless versions would remove the visible symmetry on the road.
4. **Real audio samples** for honks, sirens, birds in place of synthesis.
5. **Ghost of your best run** to race against.

The game is now split into folders (see section 3), which unblocks 1, 2 and 4: put models in `assets/models/`, audio in `assets/audio/`, and add loaders under `vendor/`.

## 6. Known limits

- Speech synthesis quality varies by device and can't be panned or Doppler-shifted.
- No multiplayer, no persistence beyond `localStorage` records.
- Three.js r128 is bundled in `vendor/`, so the game runs offline.
- Needs to be served over http(s). Opening `index.html` straight from disk blocks the textures (browser security rule for `file://`). See the README.
- The Google Street View and Maps captures used for reference were not embedded; all in-game imagery is the owner's photos or the Lovable pack.
