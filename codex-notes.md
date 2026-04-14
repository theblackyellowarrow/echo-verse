# Codex notes

## Source

This project is based on the uploaded single-file game prototype titled `Whispering Woods: EchoVerse Restoration`.

## Current architecture

- HTML markup, CSS, and JavaScript are embedded in one file.
- Tone.js is loaded from a CDN.
- The game uses canvas rendering and manual state management.
- There is no build step, asset bundling, or module boundary yet.

## Good parts worth preserving

- Clean onboarding flow with typewriter reveal
- Responsive container using aspect ratio
- Distinct game loop and timer logic
- Clear separation between guardian trees and pathfinder trees at data level
- Strong atmospheric audio concept

## First refactor pass

A sensible next pass in Codex would be:

- `public/index.html` for markup only
- `public/styles.css` for layout and component styling
- `public/game.js` for logic
- `public/audio.js` for Tone.js setup
- `public/config.js` for constants and narrative strings

## Risk areas

- Timer reset and score rollback logic should be tested after any refactor.
- Audio initialisation depends on user gesture and can break easily.
- Resize handling should be checked after canvas abstraction.
- Tree collision and fruit spawning can introduce edge-case bugs after modularisation.
