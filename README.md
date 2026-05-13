# EchoVerse

EchoVerse is a neon, arcade-style browser game about restoring a corrupted digital forest. You dodge corruption wisps, chain fruit streaks, dash through danger, and seal time-limited Resonance Rifts to keep the world alive.

It runs as vanilla HTML/CSS/JS for fast loading and easy sharing.

## Project structure

```text
echoverse-codex/
|-- public/
|   |-- index.html       (markup)
|   |-- styles.css        (styling)
|   |-- config.js         (constants & strings)
|   |-- audio.js          (Tone.js sounds)
|   |-- game.js           (game logic)
|-- server.js             (static file server)
|-- package.json
|-- .gitignore
|-- README.md
```

## What is in place

- Modular HTML/CSS/JS canvas game
- Simple local server command for previewing
- Particle effects system
- Three enemy/objective mechanics

## Run locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Gameplay

- **Collect Resonance Fruits** — Crimson (+5), Amber (+10), Violet (+20, lore drop)
- **Echo Dash** — Press Space to burst through danger with invulnerability (2s cooldown)
- **Corruption Wisps** — Hunting enemies that damage you on contact; destroyable while dashing
- **Resonance Rifts** — Timed portals that appear periodically; seal them for bonus points and double-fruit mode; unsealed rifts spawn wisps
- **Forest Restoration** — Score progresses through 8 visual layers (0–350 points to win)
- **AI Challenge** — Elon's corruption timer threatens to undo your progress
- **Guardian Trees** block movement; **Pathfinder Glyphs** mark safe routes
