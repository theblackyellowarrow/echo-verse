# EchoVerse

EchoVerse is a neon, arcade-style browser game about restoring a corrupted digital forest. You dodge corruption wisps, chain fruit streaks, dash through danger, and seal time-limited Resonance Rifts to keep the world alive.

It runs as a single HTML canvas game for fast loading and easy sharing.

## Project structure

```text
echoverse-codex/
|-- public/
|   |-- index.html
|-- docs/
|   |-- codex-notes.md
|-- package.json
|-- .gitignore
|-- README.md
```

## What is already in place

- single-file HTML canvas game
- simple local server command for previewing
- minimal structure for future refactors

## Run locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Gameplay hooks

- Streak-based scoring for fast collection
- Echo Dash to escape pressure (Space)
- Corruption Wisps that hunt the player
- Resonance Rifts: timed mini-objectives with rewards
