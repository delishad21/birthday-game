# Birthday Memory Adventure

A public edition of a birthday memory adventure game.

The player explores a small overworld, restores four memory stars through minigames, finds three soft toys, and unlocks a final gift.

The original version was built as a personalized gift with private photos, videos, music, names, and messages. This repository replaces that material with neutral placeholder assets so the project can be shared publicly and adapted by other developers.

## Some Screenshots 

<img width="2407" height="1354" alt="image" src="https://github.com/user-attachments/assets/63311a31-0b0c-4ce5-99e3-2eace120824c" />

<img width="2406" height="1352" alt="image" src="https://github.com/user-attachments/assets/45578b6c-65cc-4588-a22f-a85e1e589074" />

<img width="2407" height="1353" alt="image" src="https://github.com/user-attachments/assets/40c7540f-50be-48a9-96c7-341e768d62db" />

<img width="2405" height="1353" alt="image" src="https://github.com/user-attachments/assets/491685c4-32c4-422f-b096-7a591f8f81a9" />

<img width="2405" height="1353" alt="image" src="https://github.com/user-attachments/assets/05743202-4057-48ab-8336-131c89f8ba3f" />

<img width="2405" height="1353" alt="image" src="https://github.com/user-attachments/assets/ad7e0482-76d1-480c-8103-7ebaa68b3c80" />

## Tech Stack

- React and TypeScript for app state, overlays, editors, and UI
- Phaser for the tile-like overworld, collision, sprites, collectibles, and minigame scenes
- Vite for local development and browser builds
- Electron and electron-builder for desktop packaging
- Vitest for unit and source-structure tests

Use Node `20.17+` or Node `22 LTS` for the smoothest install with the current Electron tooling.

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Run tests and a production browser build:

```bash
npm test
npm run build
```

## How To Play

- Move with `WASD` or the arrow keys.
- Hold `Shift` to sprint.
- Press `E` or `Space` to interact.
- Explore the map, talk to toys, and complete each star challenge.
- Restore all four stars and find the three required toys to unlock the final gift.
- The Cow is an optional easter egg.

## Game Structure

### Star Of Laughter

The laughter star starts a rhythm game. Arrows scroll to the beat of the configured song, and the player must hit the matching arrow keys before exceeding the miss limit.

Main files:

- `src/game/data/laughterDance.ts` defines the song path, miss limit, pre-song buffer, and beatmap.
- `src/game/ddr/beatmap.ts` contains shared beatmap types.
- `src/components/BeatmapEditor.tsx` is the built-in editor UI.
- `public/portfolio-media/chacha-no-star.mp3` is the public demo song.

After the challenge, the game opens the laughter flipbook.

### Star Of Adventure

The adventure star is locked behind a maze. The maze is generated from a text matrix where `#` is a wall and `.` is walkable space.

Main files:

- `src/game/data/adventureArea.ts` defines the maze matrix, maze bounds, entrance cells, route checkpoints, wall sprites, and collision data.
- `tools/adventure-maze-painter.html` is the built-in maze painting tool.
- `public/adventure-area/` contains the maze floor and wall art.

After the maze, the game opens the adventure flipbook.

### Star Of Food

The food star asks the player to find missing food items around the food area and return them to the table. Each item has a table asset, a cropped floor pickup asset, and a world position.

Main files:

- `src/game/data/foodQuest.ts` defines the collectible food items.
- `src/game/data/foodArea.ts` defines the table, floor, static props, food object assets, and collision behavior.
- `public/food-area/Food/` stores full food images.
- `public/food-area/food-cropped/` stores cropped pickup versions.
- `scripts/crop-food-area-assets.mjs` regenerates cropped pickup images.

After all food is returned, the game opens the food flipbook.

### Star Of Moments

The moments star starts a timeline sorting minigame. The player receives a shuffled set of memory cards and must arrange them from oldest to newest. Dates are hidden until submission.

Main files:

- `src/game/data/memoryPhotoMinigame.ts` defines memory images, labels, descriptions, and dates.
- `src/components/MemoryPhotoOverlay.tsx` renders the sorting interface.
- `public/portfolio-media/memory-photos/` stores the demo memory images.

The game currently picks six memories per round. Change `ROUND_SIZE` in `src/components/MemoryPhotoOverlay.tsx` if you want a different round length.

After the sorting challenge, the game opens the moments flipbook.

### Toys And Final Gift

Three required toys are placed around the world: Bear, Marshmallow, and Penguin. Cow is an optional easter egg. After the four stars and required toys are collected, the final gift can be opened.

Main files:

- `src/game/data/memoryItems.ts` defines star and toy names, positions, prompts, dialogue, and collection messages.
- `src/game/data/toyAssets.ts` maps toy ids to image assets.
- `public/toys/` stores toy images.
- `src/game/data/starVisuals.ts` controls filled-star and collected-toy visuals around the final gift area.
- `src/game/data/flipbooks.ts` contains the final gift message.

## Customizing The Game

### Replace Flipbook Media And Captions

Edit `src/game/data/flipbooks.ts`.

Each non-final flipbook has four placeholder pages. A page can use an `imagePath` or `videoPath`, plus a `label`, `date`, and `description`.

Recommended public/private media locations:

- Public portfolio placeholders: `public/portfolio-media/flipbooks/`
- Private local-only media: keep it in an ignored folder and do not commit it

The current placeholder SVGs are intentionally simple: `[Image]`, `[Title]`, `[Date]`, and `[Description]`.

### Change The Maze

Open the painter directly in a browser:

```text
tools/adventure-maze-painter.html
```

Use it to paint walls and paths, then copy the exported matrix into `ADVENTURE_MAZE_MATRIX` in `src/game/data/adventureArea.ts`.

Keep these details aligned:

- The matrix should stay `44` columns by `38` rows unless you also update `ADVENTURE_MAZE_BOUNDS`.
- `#` means blocked wall.
- `.` means open path.
- `ADVENTURE_MAZE_ENTRANCE_CELLS` must remain open and reachable from the outside.
- Update `adventureMazeRouteCheckpoints` if you change the intended route significantly.

Run tests after editing the maze:

```bash
npm test
```

### Change The Laughter Song And Beatmap

Replace the song file in `public/portfolio-media/` and update `laughterDanceSong.path` in `src/game/data/laughterDance.ts`.

Start the dev server and open the beatmap editor:

```bash
npm run dev
```

```text
http://localhost:5173/?tool=beatmap
```

Record or adjust the beatmap, playtest it, then copy the exported notes into `laughterDanceBeatmap` in `src/game/data/laughterDance.ts`.

Important timing note: the last arrow should occur before the song ends, with enough room for the hit window. If a song is shorter than the beatmap, remove or retime the final notes.

### Change The Soft Toys And Conversations

Edit `src/game/data/memoryItems.ts` to change:

- Toy names
- World positions
- Interaction prompts
- Dialogue lines
- Collection messages
- Whether an item is a required `toy` or optional `easter-egg`

Replace toy art in `public/toys/`, then update `src/game/data/toyAssets.ts` if filenames or ids change.

If the final gift display should show different collected toys, update `src/game/data/starVisuals.ts`.

### Change The Food Game

Edit `src/game/data/foodQuest.ts` to change the food item ids, display names, pickup positions, and floor pickup asset paths.

Edit `src/game/data/foodArea.ts` to change the table assets, static area layers, and the food images that appear on the table after collection.

If you replace images in `public/food-area/Food/`, regenerate cropped pickup assets:

```bash
npm run crop:food
```

The crop script expects transparent RGBA PNGs and uses macOS `sips` to write files into `public/food-area/food-cropped/`.

### Change The Moments Memory Game

Add or replace memory images in `public/portfolio-media/memory-photos/`, then edit `src/game/data/memoryPhotoMinigame.ts`.

Each memory item has:

- `filename`
- ISO date used for sorting, such as `2025-04-18`
- Optional label
- Optional description

The game shuffles a subset of memories, lets the player drag them into chronological order, and checks the hidden ISO `date` values on submit.

### Change Map Layout And Placement

Useful files:

- `src/game/data/mapLayout.ts` defines area centers and core map sizing.
- `src/game/data/mapDecor.ts` defines decorative props.
- `src/game/data/memoryItems.ts` places stars and toys.
- `src/game/data/foodQuest.ts` places food pickups.
- `src/game/data/adventureArea.ts` places the maze.

After changing map scale or area positions, run through every star in the browser. Collision and camera framing are easiest to validate by playing.

## Electron Desktop App

Run the app in Electron during development:

```bash
npm run electron:dev
```

Build packaged desktop artifacts:

```bash
npm run dist:mac
npm run dist:win
```

Artifacts are written to `release/`, which is intentionally ignored by Git.

Electron loads the built Vite app through `electron/main.cjs`. App icons live in `build/icon.icns` and `build/icon.ico`. If you replace the icon, keep those filenames or update the `build` section in `package.json`.
