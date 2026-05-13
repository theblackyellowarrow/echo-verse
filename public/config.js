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
    speedMultiplier: 3.5,
    duration: 250,
    cooldown: 2000,
    trailCount: 8,
    trailLife: 300,
  },

  FRUIT: {
    radius: 12,
    count: 4,
    types: {
      crimson: { name: 'Crimson Fruit', colorHex: '#DC143C', glow: 'rgba(220, 20, 60, 0.7)', points: 5, rarity: 0.6 },
      amber:   { name: 'Amber Fruit',   colorHex: '#FF8C00', glow: 'rgba(255, 140, 0, 0.7)', points: 10, rarity: 0.3 },
      violet:  { name: 'Violet Fruit',  colorHex: '#9400D3', glow: 'rgba(148, 0, 211, 0.7)', points: 20, rarity: 0.1, isLoreShard: true },
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
    duration: 40000,
    pointsNeeded: 50,
  },

  WISPS: {
    maxCount: 5,
    spawnInterval: 12000,
    speedRatio: 0.65,
    radius: 10,
    damage: 10,
    invulnAfterHit: 1500,
  },

  RIFTS: {
    spawnInterval: 30000,
    duration: 15000,
    radius: 28,
    rewardPoints: 25,
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
