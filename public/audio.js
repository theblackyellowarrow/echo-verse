let collectSound, ambientNoise, birdSynth, animalSynth1, animalSynth2, ambientMusicLoop, noiseFilter;
let typeCharSound, lineEndSound, buttonAppearSound, happyPianoSynth;
let dashSynth, wispHitSynth, riftSynth, riftSealSynth;
let soundsReadyForOnboarding = false;
let gameSoundsReady = false;
let birdIntervalId = null;
let animalIntervalId1 = null;
let animalIntervalId2 = null;
let endLoopInstance = null;
let currentBirdIntervalTime = 7500;

async function initOnboardingAudio() {
  if (soundsReadyForOnboarding) return;
  if (Tone.context.state !== 'running') {
    try { await Tone.start(); console.log('Audio context started for onboarding.'); }
    catch (e) { console.error('Error starting Tone.js for onboarding:', e); return; }
  }
  typeCharSound = new Tone.MembraneSynth({
    pitchDecay: 0.004, octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
    volume: -32,
  }).toDestination();
  lineEndSound = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.01, release: 0.1 },
    volume: -24,
  }).toDestination();
  buttonAppearSound = new Tone.Synth({
    oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.05, release: 0.2 },
    volume: -20,
  }).toDestination();
  soundsReadyForOnboarding = true;
}

async function initGameAudio() {
  if (gameSoundsReady) return;
  if (Tone.context.state !== 'running') {
    try { await Tone.start(); }
    catch (e) { console.error('Audio context failed to start for game sounds:', e); return; }
  }
  collectSound = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.01, release: 0.2 },
    volume: -7,
  }).toDestination();

  ambientNoise = new Tone.Noise('brown').start();
  ambientNoise.volume.value = -40;
  noiseFilter = new Tone.AutoFilter({
    frequency: '10m', baseFrequency: 70, octaves: 4.5, depth: 0.65,
  }).toDestination();
  ambientNoise.connect(noiseFilter);

  birdSynth = new Tone.FMSynth({
    harmonicity: 1.5, modulationIndex: 2,
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.3 },
    volume: -24,
  }).toDestination();

  animalSynth1 = new Tone.MembraneSynth({
    pitchDecay: 0.02, octaves: 4,
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.02, release: 0.4 },
    volume: -20,
  }).toDestination();

  animalSynth2 = new Tone.PluckSynth({
    attackNoise: 0.5, dampening: 6000, resonance: 0.8,
    volume: -18,
  }).toDestination();

  const finalSynth = new Tone.PolySynth(Tone.AMSynth, {
    harmonicity: 1.2,
    envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 4.5 },
    volume: -14,
  }).toDestination();
  const reverb = new Tone.Reverb(4.5).toDestination();
  finalSynth.connect(reverb);

  ambientMusicLoop = new Tone.Pattern(
    (time, note) => { finalSynth.triggerAttackRelease(note, '4m', time + 0.001); },
    ['C3', 'Eb3', 'G3', 'Bb3', 'G3', 'D3', 'F2', 'Ab2'],
    'randomWalk',
  );
  ambientMusicLoop.interval = '2m';

  const pianoChorus = new Tone.Chorus(0.15, 3, 0.7).toDestination().start();
  happyPianoSynth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2.5, modulationIndex: 12,
    envelope: { attack: 0.015, decay: 0.5, sustain: 0.15, release: 1.0 },
    modulationEnvelope: { attack: 0.015, decay: 0.3, sustain: 0.08, release: 0.7 },
    volume: -8,
  }).connect(pianoChorus);

  dashSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
    volume: -18,
  }).toDestination();

  wispHitSynth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -14,
  }).toDestination();

  riftSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 0.5 },
    volume: -16,
  }).toDestination();

  riftSealSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.4, sustain: 0.1, release: 0.6 },
    volume: -12,
  }).toDestination();

  gameSoundsReady = true;
  updateAmbientSounds();
}

function stopSoundIntervals() {
  if (birdIntervalId) { clearInterval(birdIntervalId); birdIntervalId = null; }
  if (animalIntervalId1) { clearInterval(animalIntervalId1); animalIntervalId1 = null; }
  if (animalIntervalId2) { clearInterval(animalIntervalId2); animalIntervalId2 = null; }
}

function startBirdSounds() {
  stopSoundIntervals();
  birdIntervalId = setInterval(() => {
    const safeLayer = currentForestLayer || 1;
    const progression = (safeLayer - 1) / (CONFIG.FOREST.maxLayer - 1);
    let noteToPlay = 'C4';
    let playBird = false;
    if (safeLayer <= 2) { noteToPlay = 'C#3'; playBird = true; }
    else if (safeLayer <= 4) { noteToPlay = 'E4'; playBird = true; }
    else if (safeLayer < CONFIG.FOREST.maxLayer) { noteToPlay = 'G#4'; playBird = true; }
    if (playBird && score < CONFIG.FOREST.winningScore && birdSynth && gameSoundsReady && birdSynth.volume.value > -Infinity) {
      try {
        const randomDelay = Math.random() * 0.7 + 0.1;
        birdSynth.triggerAttackRelease(noteToPlay, `${0.4 + progression * 0.3}n`, Tone.now() + randomDelay);
      } catch (e) { console.error('Error in bird sound interval:', e); }
    }
  }, currentBirdIntervalTime + Math.random() * 3000);
}

function startFinalAnimalSounds() {
  if (!animalIntervalId1 && animalSynth1 && gameSoundsReady) {
    animalIntervalId1 = setInterval(() => {
      if (Math.random() < 0.3 && animalSynth1.volume.value > -Infinity) {
        try { animalSynth1.triggerAttackRelease('G2', '1n', Tone.now() + Math.random() * 0.5 + 0.05); }
        catch (e) { console.error('Error in animalSynth1 interval:', e); }
      }
    }, 5000 + Math.random() * 2000);
  }
  if (!animalIntervalId2 && animalSynth2 && gameSoundsReady) {
    animalIntervalId2 = setInterval(() => {
      if (Math.random() < 0.4 && animalSynth2.volume.value > -Infinity) {
        try { animalSynth2.triggerAttackRelease('C4', '2n', Tone.now() + Math.random() * 0.3 + 0.05); }
        catch (e) { console.error('Error in animalSynth2 interval:', e); }
      }
    }, 3500 + Math.random() * 1500);
  }
}

function updateAmbientSounds() {
  if (!gameSoundsReady) return;

  if (ambientMusicLoop && ambientMusicLoop.state === 'started' && (currentForestLayer || 1) < CONFIG.FOREST.maxLayer) {
    ambientMusicLoop.stop();
    Tone.Transport.clear(ambientMusicLoop);
  }
  stopSoundIntervals();

  const safeLayer = currentForestLayer || 1;
  const progression = (safeLayer - 1) / (CONFIG.FOREST.maxLayer - 1);
  const noiseVolume = -40 + 15 * progression;
  const filterFreq = 70 + 430 * progression;
  currentBirdIntervalTime = 7500 - 4500 * progression;

  if (safeLayer >= CONFIG.FOREST.maxLayer && score >= CONFIG.FOREST.winningScore) {
    if (ambientNoise && ambientNoise.volume) ambientNoise.volume.value = -30;
    if (noiseFilter && noiseFilter.baseFrequency) noiseFilter.baseFrequency.value = 600;
    if (birdSynth && birdSynth.volume) birdSynth.volume.value = -18;
    currentBirdIntervalTime = 2000;
    startBirdSounds();
    startFinalAnimalSounds();
    if (ambientMusicLoop && ambientMusicLoop.state !== 'started') {
      Tone.Transport.bpm.value = 60;
      ambientMusicLoop.start(0);
    }
    if (happyPianoSynth) {
      const now = Tone.now();
      const melody = ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'D4', 'F4', 'A4', 'C5', 'A4', 'F4', 'D4', 'E4', 'G4', 'B4', 'D5', 'C5'];
      melody.forEach((note, index) => {
        happyPianoSynth.triggerAttackRelease(note, '8n', now + index * 0.25, 0.8);
      });
    }
    return;
  }

  if (ambientNoise && ambientNoise.volume) ambientNoise.volume.value = noiseVolume;
  if (noiseFilter && noiseFilter.baseFrequency) noiseFilter.baseFrequency.value = filterFreq;

  if (score < CONFIG.FOREST.winningScore) {
    if (birdSynth && birdSynth.volume) birdSynth.volume.value = -24 + 6 * progression;
    startBirdSounds();
  } else {
    if (birdSynth && birdSynth.volume) birdSynth.volume.value = -Infinity;
  }
}

function playCollectSound(points) {
  if (!gameSoundsReady || !collectSound) return;
  try {
    const note = points === 20 ? 'E5' : (points === 10 ? 'D5' : 'C5');
    collectSound.triggerAttackRelease(note, '8n', Tone.now());
  } catch (e) { /* silent */ }
}

function playDashSound() {
  if (!gameSoundsReady || !dashSynth) return;
  try { dashSynth.triggerAttackRelease('A3', '16n', Tone.now()); }
  catch (e) { /* silent */ }
}

function playWispHitSound() {
  if (!gameSoundsReady || !wispHitSynth) return;
  try { wispHitSynth.triggerAttackRelease('G2', '8n', Tone.now()); }
  catch (e) { /* silent */ }
}

function playRiftSpawnSound() {
  if (!gameSoundsReady || !riftSynth) return;
  try { riftSynth.triggerAttackRelease('C4', '4n', Tone.now()); }
  catch (e) { /* silent */ }
}

function playRiftSealSound() {
  if (!gameSoundsReady || !riftSealSynth) return;
  try { riftSealSynth.triggerAttackRelease('E5', '2n', Tone.now()); }
  catch (e) { /* silent */ }
}
