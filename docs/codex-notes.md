# Codex notes

## Source

This project is based on the uploaded single-file game prototype titled `Whispering Woods: EchoVerse Restoration`.

## Current architecture

Modularised into separate concerns:

```text
echoverse-codex/
|-- public/
|   |-- index.html       (markup + script references)
|   |-- styles.css        (all layout and component styling)
|   |-- config.js         (constants, data, narrative strings)
|   |-- audio.js          (Tone.js setup and sound functions)
|   |-- game.js           (main game state, loop, mechanics)
|-- server.js             (Node HTTP static file server)
|-- package.json
|-- .gitignore
|-- README.md
```

- Tone.js loaded from CDN in index.html
- Canvas rendering via requestAnimationFrame
- No build step required — plain HTML/CSS/JS served statically

## Game features

### Original (preserved)
- Clean onboarding flow with typewriter reveal
- Responsive container using aspect ratio
- Forest layer system (8 layers) that transforms visually as score increases
- Guardian trees (block movement) vs Pathfinder trees (safe passage)
- Three fruit types with rarity-based spawning
- AI corruption timer — lose layers if not earning enough points
- Ambient audio that evolves with forest restoration

### New features (upgraded)
- **Echo Dash** — Space key triggers a burst of speed with cooldown, invulnerability frames, visual trail effect, and dedicated synth sound
- **Corruption Wisps** — Enemies spawn from edges tracking the player; contact deals damage and triggers a taunt; invulnerable during dash
- **Resonance Rifts** — Timed portal mini-objectives appear periodically; sealing a rift awards bonus points and temporary double-fruit spawning; unsealed rifts collapse and spawn wisps
- **Particle system** — Fruit collection bursts, dash trail particles, wisp corruption trails, rift ambient particles, rift-seal celebration
- **HUD additions** — Dash cooldown indicator in the header
- **Modular code** — Single-file monolith split into config, audio, game JS and standalone CSS

## Good parts worth preserving

- Clear separation of concerns across config, audio, rendering, and game logic
- Responsive container using aspect ratio
- Distinct game loop and timer logic
- Clear separation between guardian trees and pathfinder trees at data level
- Strong atmospheric audio concept
- Particle system architecture ready for expansion

## Risk areas

- Timer reset and score rollback logic should be tested after any refactor.
- Audio initialisation depends on user gesture and can break easily.
- Resize handling should be checked after canvas abstraction.
- Tree collision and fruit spawning can introduce edge-case bugs.
- Wisp spawning from rifts should be verified under edge conditions.
- Double-fruit mode cleanup when timer expires should be tested.
