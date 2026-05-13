const CONFIG = {
  INFO_BAND_HEIGHT: 50,
  GAME_WIDTH: 800,
  GAME_HEIGHT: 550,

  PLAYER: {
    radius: 10,
    speed: 2.5,
    color: '#FFD700',
  },

  DASH: {
    speedMultiplier: 4.0,
    duration: 300,
    cooldown: 1200,
    trailCount: 10,
    trailLife: 300,
    wispKillPoints: 5,
  },

  FRUIT: {
    radius: 12,
    count: 5,
    types: {
      crimson: { name: 'Crimson Fruit', colorHex: '#DC143C', glow: 'rgba(220, 20, 60, 0.7)', points: 5, rarity: 0.35 },
      amber:   { name: 'Amber Fruit',   colorHex: '#FF8C00', glow: 'rgba(255, 140, 0, 0.7)', points: 10, rarity: 0.40 },
      violet:  { name: 'Violet Fruit',  colorHex: '#9400D3', glow: 'rgba(148, 0, 211, 0.7)', points: 20, rarity: 0.25, isLoreShard: true },
    },
  },

  TREES: {
    count: 75,
    pathfinderChance: 0.18,
    minDist: 38,
    playerSafeRadius: 120,
  },

  FOREST: {
    maxLayer: 8,
    pointsPerLayer: 50,
    winningScore: 350,
  },

  AI_CHALLENGE: {
    duration: 30000,
    pointsNeeded: 40,
  },

  POWERUPS: {
    spawnInterval: 18000,
    types: {
      repel: { name: 'Wisp Repellent', colorHex: '#45f3ff', glow: 'rgba(69, 243, 255, 0.8)', duration: 8000 },
      speed: { name: 'Speed Boost',    colorHex: '#9cff57', glow: 'rgba(156, 255, 87, 0.8)', duration: 5000, multiplier: 1.8 },
    },
  },

  LEVELS: [
    {
      id: 1,
      name: 'The Silent Glade',
      scoreMin: 0,
      scoreMax: 120,
      subheader: 'A forgotten clearing beneath the surface',
      bgStart: [8, 15, 24],
      bgEnd: [18, 35, 50],
      trunkStart: [40, 35, 30],
      trunkEnd: [55, 45, 35],
      canopyDarkStart: [18, 45, 20],
      canopyDarkEnd: [35, 70, 35],
      canopyLightStart: [28, 55, 28],
      canopyLightEnd: [50, 85, 50],
      wispMax: 3,
      wispSpeedRatio: 0.60,
      wispSpawnInterval: 9000,
      wispDamage: 8,
      riftsEnabled: false,
    },
    {
      id: 2,
      name: 'The Corrupted Grove',
      scoreMin: 120,
      scoreMax: 240,
      subheader: 'Elon\'s influence spreads like a virus',
      bgStart: [18, 12, 28],
      bgEnd: [35, 20, 50],
      trunkStart: [50, 38, 38],
      trunkEnd: [70, 55, 50],
      canopyDarkStart: [25, 30, 35],
      canopyDarkEnd: [45, 50, 65],
      canopyLightStart: [35, 40, 45],
      canopyLightEnd: [55, 60, 75],
      wispMax: 5,
      wispSpeedRatio: 0.72,
      wispSpawnInterval: 7000,
      wispDamage: 12,
      riftsEnabled: true,
      riftSpawnInterval: 28000,
      riftDuration: 14000,
      riftReward: 25,
    },
    {
      id: 3,
      name: 'Elon\'s Core',
      scoreMin: 240,
      scoreMax: 350,
      subheader: 'The heart of corruption beats here',
      bgStart: [40, 15, 10],
      bgEnd: [55, 30, 15],
      trunkStart: [60, 40, 30],
      trunkEnd: [90, 55, 40],
      canopyDarkStart: [50, 35, 20],
      canopyDarkEnd: [75, 55, 30],
      canopyLightStart: [65, 45, 25],
      canopyLightEnd: [95, 65, 40],
      wispMax: 7,
      wispSpeedRatio: 0.85,
      wispSpawnInterval: 5000,
      wispDamage: 18,
      riftsEnabled: true,
      riftSpawnInterval: 22000,
      riftDuration: 12000,
      riftReward: 30,
    },
  ],

  RIFT_BASE: {
    radius: 28,
    doubleFruitDuration: 10000,
  },

  PARTICLES: {
    fruitBurstCount: 8,
    fruitBurstLife: 400,
    riftParticleCount: 6,
    riftParticleLife: 600,
    wispTrailCount: 3,
    wispTrailLife: 500,
  },

  ONBOARDING: {
    typingSpeed: 22,
    interLinePause: 200,
    preButtonPause: 300,
    lines: [
      'An AI called Elon has broken this digital forest.',
      'It\'s now just pixelated echoes of what it once was.',
      'You are a Restorer. You can fix this place.',
      'Find the glowing Resonance Fruits to heal the EchoVerse.',
      'Glowing trees, the Pathfinder Glyphs, show safe paths.',
      'Use WASD or Arrow Keys to move. Press SPACE to Echo Dash!',
      'Beware: Corruption Wisps hunt you. Seal Resonance Rifts!',
    ],
  },

  LORE: [
    'Once, light flowed here like rivers of pure data...',
    'The EchoVerse sang songs of perfect code, now just whispers.',
    'Silicon leaves held starlight; now only pixelated dust remains.',
    'This was a place of balance, before Elon\'s cold logic fractured it.',
    'Each Resonance Fruit holds a memory of what was lost.',
    'The Pathfinder Glyphs are echoes of the forest\'s ancient pathways.',
    'Can you hear the silence where the data streams once roared?',
  ],

  AI_TAUNTS: [
    'Elon: Your efforts are... statistically insignificant.',
    'Elon: The pixels realign to my superior design.',
    'Elon: Order will be restored. My order.',
    'Elon: You cannot mend what is already optimized by entropy.',
    'Elon: This forest\'s "beauty" was an inefficient algorithm.',
    'Elon: Corruption is merely a new form of perfection.',
  ],
};
