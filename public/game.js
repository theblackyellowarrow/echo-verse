const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const aiChallengeTimerDisplay = document.getElementById('aiChallengeTimerDisplay');
const dashCooldownDisplay = document.getElementById('dashCooldownDisplay');
const messageDisplayContainer = document.getElementById('messageDisplayContainer');
const messageDisplay = document.getElementById('messageDisplay');
const restartGameButton = document.getElementById('restartGameButton');
const onboardingScreen = document.getElementById('onboardingScreen');
const typewriterContainer = document.getElementById('typewriterContainer');
const fruitIntroContainer = document.getElementById('fruitIntroContainer');
const beginRestorationButton = document.getElementById('beginRestorationButton');
const startGameButton = document.getElementById('startGameButton');
const uiOverlay = document.getElementById('uiOverlay');
const dynamicMessageOverlay = document.getElementById('dynamicMessageOverlay');

const INFO_BAND_HEIGHT = CONFIG.INFO_BAND_HEIGHT;
const gameContainer = document.getElementById('gameContainer');
let gameWidth = CONFIG.GAME_WIDTH;
let gameHeight = CONFIG.GAME_HEIGHT;

function updateGameDimensions() {
  const containerWidth = gameContainer.offsetWidth;
  gameWidth = containerWidth > 0 ? containerWidth : CONFIG.GAME_WIDTH;
  const containerHeight = gameContainer.offsetHeight;
  gameHeight = containerHeight > INFO_BAND_HEIGHT ? containerHeight - INFO_BAND_HEIGHT : CONFIG.GAME_HEIGHT;
  canvas.width = gameWidth;
  canvas.height = gameHeight;
}

window.addEventListener('DOMContentLoaded', updateGameDimensions);
window.addEventListener('resize', updateGameDimensions);

let score = 0;
let currentForestLayer = 1;
let currentLevel = 0;
let levelTransition = null;
let messageShown = false;
let gameStarted = false;
let gameEnded = false;
let requestId = null;

const player = {
  x: gameWidth / 2, y: gameHeight / 2,
  radius: CONFIG.PLAYER.radius,
  speed: CONFIG.PLAYER.speed,
  color: CONFIG.PLAYER.color,
  dx: 0, dy: 0,
  isDashing: false,
  dashCooldown: 0,
  dashTimer: 0,
  invulnerable: false,
  invulnTimer: 0,
};

let fruits = [];
const fruitRadius = CONFIG.FRUIT.radius;
const numFruits = CONFIG.FRUIT.count;
const fruitData = CONFIG.FRUIT.types;

let trees = [];
const treeCount = CONFIG.TREES.count;
const pathfinderTreeChance = CONFIG.TREES.pathfinderChance;

let wisps = [];
let wispSpawnTimer = 0;

let rift = null;
let riftSpawnTimer = 0;
let doubleFruitActive = false;
let doubleFruitTimer = 0;

let particles = [];

let aiChallengeTimer = CONFIG.AI_CHALLENGE.duration;
let scoreAtChallengeStart = 0;

const loreFragments = CONFIG.LORE;
const aiTaunts = CONFIG.AI_TAUNTS;
const onboardingLines = CONFIG.ONBOARDING.lines;

let currentParagraphIndex = 0;
let currentCharIndex = 0;
const typingSpeed = CONFIG.ONBOARDING.typingSpeed;
const interLinePause = CONFIG.ONBOARDING.interLinePause;
const preButtonPause = CONFIG.ONBOARDING.preButtonPause;

function typeCharacter() {
  if (currentParagraphIndex >= onboardingLines.length) {
    const cursor = typewriterContainer.querySelector('.typewriter-cursor');
    if (cursor) cursor.remove();
    setTimeout(() => {
      beginRestorationButton.classList.add('visible');
      if (soundsReadyForOnboarding && buttonAppearSound)
        buttonAppearSound.triggerAttackRelease('C5', '4n', Tone.now() + 0.1);
    }, preButtonPause);
    return;
  }
  let p = typewriterContainer.children?.[currentParagraphIndex];
  if (!p) {
    p = document.createElement('p');
    typewriterContainer.appendChild(p);
  }
  const textToType = onboardingLines?.[currentParagraphIndex];
  if (currentCharIndex === 0) {
    p.innerHTML = '';
    p.classList.add('visible-line');
    for (let i = 0; i < currentParagraphIndex; i++) {
      if (typewriterContainer.children?.[i]) typewriterContainer.children?.[i].classList.add('dimmed-line');
    }
  }
  const currentTextContent = p.textContent?.replace(/.$/, '');
  if (currentCharIndex < textToType?.length) {
    p.textContent = currentTextContent + textToType?.[currentCharIndex];
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    p.appendChild(cursorSpan);
    if (soundsReadyForOnboarding && typeCharSound && currentCharIndex % 2 === 0) {
      try { typeCharSound.triggerAttackRelease('G#5', '128n', Tone.now() + 0.001); } catch (e) {}
    }
    currentCharIndex++;
    setTimeout(typeCharacter, typingSpeed);
  } else {
    p.textContent = textToType;
    if (soundsReadyForOnboarding && lineEndSound) {
      try { lineEndSound.triggerAttackRelease('E5', '16n', Tone.now() + 0.01); } catch (e) {}
    }
    currentParagraphIndex++;
    currentCharIndex = 0;
    setTimeout(typeCharacter, interLinePause);
  }
}

function initGame() {
  score = 0;
  currentForestLayer = 1;
  currentLevel = 0;
  levelTransition = null;
  messageShown = false;
  gameEnded = false;
  wisps = [];
  wispSpawnTimer = 0;
  rift = null;
  riftSpawnTimer = 0;
  doubleFruitActive = false;
  doubleFruitTimer = 0;
  particles = [];
  aiChallengeTimer = CONFIG.AI_CHALLENGE.duration;
  scoreAtChallengeStart = 0;

  if (aiChallengeTimerDisplay) aiChallengeTimerDisplay.style.display = 'block';
  if (dashCooldownDisplay) dashCooldownDisplay.style.display = 'block';

  player.x = gameWidth / 2;
  player.y = gameHeight / 2;
  player.dx = 0;
  player.dy = 0;
  player.isDashing = false;
  player.dashCooldown = 0;
  player.dashTimer = 0;
  player.invulnerable = false;
  player.invulnTimer = 0;

  updateScoreDisplay();
  messageDisplayContainer.style.display = 'none';
  generateTrees();
  fruits = [];
  for (let i = 0; i < numFruits; i++) {
    spawnFruit();
  }

  if (gameSoundsReady) {
    if (ambientMusicLoop && ambientMusicLoop.state === 'started') {
      ambientMusicLoop.stop();
      Tone.Transport.clear(ambientMusicLoop);
    }
    Tone.Transport.bpm.value = 90;
    Tone.Transport.start('+0.1');
    updateAmbientSounds();
  }

  if (requestId) { cancelAnimationFrame(requestId); requestId = null; }
  lastTimestamp = performance.now();
  if (gameStarted) { requestId = requestAnimationFrame(gameLoop); }
}

beginRestorationButton.addEventListener('click', () => {
  typewriterContainer.classList.add('hidden');
  beginRestorationButton.classList.remove('visible');
  beginRestorationButton.classList.add('hidden');
  fruitIntroContainer.classList.remove('hidden');
  fruitIntroContainer.classList.add('visible');
  setTimeout(() => {
    startGameButton.classList.remove('hidden');
    startGameButton.classList.add('visible');
    if (soundsReadyForOnboarding && buttonAppearSound)
      buttonAppearSound.triggerAttackRelease('D5', '4n', Tone.now() + 0.05);
  }, 500);
});

function startGameButtonHandler() {
  onboardingScreen.classList.add('fade-out');
  initGameAudio().then(() => {
    gameStarted = true;
    initGame();
  }).catch((e) => {
    console.error('Error initializing game audio, starting game without it:', e);
    gameStarted = true;
    initGame();
  });
  setTimeout(() => {
    canvas.classList.add('visible');
    uiOverlay.classList.add('visible');
  }, 700);
}

startGameButton.addEventListener('click', startGameButtonHandler);

function getLevelForScore(s) {
  for (let i = CONFIG.LEVELS.length - 1; i >= 0; i--) {
    if (s >= CONFIG.LEVELS[i].scoreMin) return i;
  }
  return 0;
}

function getCurrentLevelConfig() {
  return CONFIG.LEVELS[currentLevel] || CONFIG.LEVELS[0];
}

function triggerLevelTransition(newLevel) {
  const lvl = CONFIG.LEVELS[newLevel];
  levelTransition = {
    level: newLevel,
    name: lvl.name,
    subheader: lvl.subheader,
    timer: 2500,
  };
  const levelOverlay = document.getElementById('levelTransitionOverlay');
  const levelTitle = document.getElementById('levelTransitionTitle');
  const levelSub = document.getElementById('levelTransitionSub');
  if (levelOverlay && levelTitle && levelSub) {
    levelTitle.textContent = lvl.name;
    levelSub.textContent = lvl.subheader;
    levelOverlay.classList.add('visible');
  }
  currentLevel = newLevel;
  uiOverlay.classList.add('visible');
  if (gameSoundsReady && riftSynth) {
    try { riftSynth.triggerAttackRelease('C5', '2n', Tone.now()); }
    catch (e) { /* silent */ }
  }
}

function endLevelTransition() {
  const levelOverlay = document.getElementById('levelTransitionOverlay');
  if (levelOverlay) levelOverlay.classList.remove('visible');
  levelTransition = null;
}

restartGameButton.addEventListener('click', () => {
  messageDisplayContainer.style.display = 'none';
  if (requestId) { cancelAnimationFrame(requestId); requestId = null; }
  if (gameSoundsReady && endLoopInstance && endLoopInstance.state === 'started') {
    endLoopInstance.stop(0); endLoopInstance.dispose(); endLoopInstance = null;
  }
  if (gameSoundsReady && ambientMusicLoop && ambientMusicLoop.state === 'started') {
    ambientMusicLoop.stop(0); Tone.Transport.stop(); Tone.Transport.cancel(0);
  }
  stopSoundIntervals();
  initGame();
});

function generateTrees() {
  trees = [];
  const playerSafeRadius = CONFIG.TREES.playerSafeRadius;
  const treeMinDist = CONFIG.TREES.minDist;
  for (let i = 0; i < treeCount; i++) {
    let treeX, treeY, validPosition;
    let attempts = 0;
    do {
      validPosition = true;
      treeX = Math.random() * gameWidth;
      treeY = Math.random() * gameHeight;
      if (Math.hypot(treeX - player.x, treeY - player.y) < playerSafeRadius) validPosition = false;
      if (validPosition) {
        for (const t of trees) {
          if (Math.hypot(treeX - t.x, treeY - t.y) < treeMinDist) { validPosition = false; break; }
        }
      }
      attempts++;
    } while (!validPosition && attempts < 200);
    if (validPosition) {
      const isPathfinder = Math.random() < pathfinderTreeChance;
      trees.push({
        x: treeX, y: treeY,
        type: isPathfinder ? 'pathfinder' : 'guardian',
        glowPhase: Math.random() * Math.PI * 2,
      });
    }
  }
}

function spawnFruit() {
  const maxFruits = doubleFruitActive ? numFruits * 2 : numFruits;
  if (fruits.length >= maxFruits || (score >= CONFIG.FOREST.winningScore && gameEnded)) return;
  let fruitX, fruitY, validPosition;
  let attempts = 0;
  let fruitTypeKey = 'crimson';
  const rand = Math.random();
  if (rand < fruitData.violet.rarity) fruitTypeKey = 'violet';
  else if (rand < fruitData.violet.rarity + fruitData.amber.rarity) fruitTypeKey = 'amber';
  const selectedFruitData = fruitData?.[fruitTypeKey];
  do {
    validPosition = true;
    fruitX = Math.random() * (gameWidth - fruitRadius * 2) + fruitRadius;
    fruitY = Math.random() * (gameHeight - fruitRadius * 2) + fruitRadius;
    if (Math.hypot(fruitX - player.x, fruitY - player.y) < fruitRadius + player.radius + 45) validPosition = false;
    if (validPosition) {
      for (const f of fruits) {
        if (Math.hypot(fruitX - f.x, fruitY - f.y) < fruitRadius * 5.5) { validPosition = false; break; }
      }
    }
    if (validPosition) {
      for (const tree of trees) {
        if (tree.type === 'guardian') {
          const treeStyle = getTreeSize(currentForestLayer || 1, tree.type);
          const treeLeft = tree.x - treeStyle.width / 2;
          const treeRight = tree.x + treeStyle.width / 2;
          const treeTop = tree.y - treeStyle.height / 2;
          const treeBottom = tree.y + treeStyle.height / 2;
          const fruitAccessRadius = fruitRadius + player.radius * 1.2;
          const closestX = Math.max(treeLeft, Math.min(fruitX, treeRight));
          const closestY = Math.max(treeTop, Math.min(fruitY, treeBottom));
          const distSq = (fruitX - closestX) ** 2 + (fruitY - closestY) ** 2;
          if (distSq < fruitAccessRadius * fruitAccessRadius) { validPosition = false; break; }
        }
      }
    }
    if (validPosition && rift) {
      if (Math.hypot(fruitX - rift.x, fruitY - rift.y) < rift.radius + fruitRadius + 20) validPosition = false;
    }
    attempts++;
  } while (!validPosition && attempts < 250);
  if (validPosition) {
    fruits.push({ x: fruitX, y: fruitY, ...selectedFruitData });
  }
}

function spawnWisp() {
  const lvl = getCurrentLevelConfig();
  if (wisps.length >= lvl.wispMax) return;
  let wx, wy;
  let valid = false;
  let attempts = 0;
  do {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: wx = Math.random() * gameWidth; wy = -20; break;
      case 1: wx = gameWidth + 20; wy = Math.random() * gameHeight; break;
      case 2: wx = Math.random() * gameWidth; wy = gameHeight + 20; break;
      case 3: wx = -20; wy = Math.random() * gameHeight; break;
    }
    wx = Math.max(0, Math.min(gameWidth, wx));
    wy = Math.max(0, Math.min(gameHeight, wy));
    if (Math.hypot(wx - player.x, wy - player.y) > 120) valid = true;
    attempts++;
  } while (!valid && attempts < 50);
  if (valid) {
    const lvl = getCurrentLevelConfig();
    wisps.push({
      x: wx, y: wy, radius: 10,
      speed: player.speed * lvl.wispSpeedRatio,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function spawnRift() {
  const lvl = getCurrentLevelConfig();
  if (rift || !lvl.riftsEnabled) return;
  let rx, ry, valid;
  let attempts = 0;
  do {
    valid = true;
    rx = CONFIG.RIFT_BASE.radius * 2 + Math.random() * (gameWidth - CONFIG.RIFT_BASE.radius * 4);
    ry = CONFIG.RIFT_BASE.radius * 2 + Math.random() * (gameHeight - CONFIG.RIFT_BASE.radius * 4);
    if (Math.hypot(rx - player.x, ry - player.y) < 100) valid = false;
    if (valid) {
      for (const t of trees) {
        if (Math.hypot(rx - t.x, ry - t.y) < CONFIG.RIFT_BASE.radius + 35) { valid = false; break; }
      }
    }
    attempts++;
  } while (!valid && attempts < 100);
  if (valid) {
    rift = {
      x: rx, y: ry,
      radius: CONFIG.RIFT_BASE.radius,
      timer: lvl.riftDuration || CONFIG.RIFT_BASE.doubleFruitDuration,
      sealed: false,
      phase: 0,
      reward: lvl.riftReward || 25,
    };
    playRiftSpawnSound();
    showDynamicMessage('A Resonance Rift has opened! Seal it quickly!', 2500);
  }
}

function spawnFruitBurst(x, y, color) {
  for (let i = 0; i < CONFIG.PARTICLES.fruitBurstCount; i++) {
    const angle = (Math.PI * 2 / CONFIG.PARTICLES.fruitBurstCount) * i + Math.random() * 0.3;
    const speed = 1 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: CONFIG.PARTICLES.fruitBurstLife,
      maxLife: CONFIG.PARTICLES.fruitBurstLife,
      color,
      radius: 2 + Math.random() * 3,
    });
  }
}

function spawnDashTrail(x, y) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: CONFIG.DASH.trailLife,
    maxLife: CONFIG.DASH.trailLife,
    color: CONFIG.PLAYER.color,
    radius: 3 + Math.random() * 4,
  });
}

function spawnRiftParticles(riftObj) {
  if (riftObj.sealed) return;
  particles.push({
    x: riftObj.x + (Math.random() - 0.5) * riftObj.radius * 1.5,
    y: riftObj.y + (Math.random() - 0.5) * riftObj.radius * 1.5,
    vx: (Math.random() - 0.5) * 1,
    vy: (Math.random() - 0.5) * 1 - 0.5,
    life: CONFIG.PARTICLES.riftParticleLife,
    maxLife: CONFIG.PARTICLES.riftParticleLife,
    color: '#45f3ff',
    radius: 1.5 + Math.random() * 2.5,
  });
}

function spawnWispTrail(wisp) {
  particles.push({
    x: wisp.x,
    y: wisp.y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    life: CONFIG.PARTICLES.wispTrailLife,
    maxLife: CONFIG.PARTICLES.wispTrailLife,
    color: 'rgba(160, 32, 240, 0.6)',
    radius: 1.5 + Math.random() * 2,
  });
}

function spawnRiftSealBurst(x, y) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 / 16) * i;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 700, maxLife: 700,
      color: '#9cff57',
      radius: 3 + Math.random() * 4,
    });
  }
}

function actDash() {
  if (player.dashCooldown > 0 || player.isDashing) return;
  player.isDashing = true;
  player.dashTimer = CONFIG.DASH.duration;
  player.dashCooldown = CONFIG.DASH.cooldown;
  player.invulnerable = true;
  player.invulnTimer = CONFIG.DASH.duration;
  playDashSound();
  for (let i = 0; i < CONFIG.DASH.trailCount; i++) {
    spawnDashTrail(player.x, player.y);
  }
}

function updatePlayerTimers(dt) {
  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  if (player.isDashing) {
    player.dashTimer -= dt;
    if (player.dashTimer <= 0) {
      player.isDashing = false;
      player.dashTimer = 0;
    }
  }
  if (player.invulnerable) {
    player.invulnTimer -= dt;
    if (player.invulnTimer <= 0) {
      player.invulnerable = false;
      player.invulnTimer = 0;
    }
  }
  if (dashCooldownDisplay) {
    if (player.dashCooldown > 0) {
      const secs = Math.ceil(player.dashCooldown / 1000);
      dashCooldownDisplay.textContent = `Dash: ${secs}s`;
    } else if (player.isDashing) {
      dashCooldownDisplay.textContent = 'DASHING!';
    } else {
      dashCooldownDisplay.textContent = 'Dash: Ready';
    }
  }
}

function drawPlayer() {
  ctx.save();
  if (player.invulnerable) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
  }
  if (player.isDashing) {
    ctx.shadowColor = 'rgba(69, 243, 255, 0.9)';
    ctx.shadowBlur = 25;
  }
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.shadowColor = player.isDashing ? 'rgba(69, 243, 255, 0.9)' : 'rgba(255, 223, 0, 0.8)';
  ctx.shadowBlur = player.isDashing ? 25 : 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
  ctx.restore();
}

function drawFruits() {
  fruits.forEach((fruit) => {
    ctx.save();
    const glowSize = fruitRadius * 1.6 + Math.sin(Date.now() / 280 + fruit.x) * 3.5;
    const coreSize = fruitRadius * 0.75;
    const gradient = ctx.createRadialGradient(fruit.x, fruit.y, coreSize * 0.15, fruit.x, fruit.y, glowSize);
    gradient.addColorStop(0, 'rgba(255, 255, 240, 1)');
    gradient.addColorStop(0.3, fruit.glow.replace('0.7', '0.9'));
    gradient.addColorStop(0.6, fruit.glow);
    gradient.addColorStop(1, fruit.glow.replace('0.7', '0'));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fruit.colorHex;
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, coreSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawWisps() {
  wisps.forEach((wisp) => {
    ctx.save();
    const pulse = 1 + Math.sin(Date.now() / 300 + wisp.phase) * 0.25;
    const r = wisp.radius * pulse;
    const gradient = ctx.createRadialGradient(wisp.x, wisp.y, r * 0.1, wisp.x, wisp.y, r * 1.4);
    gradient.addColorStop(0, 'rgba(200, 100, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(120, 40, 180, 0.6)');
    gradient.addColorStop(1, 'rgba(60, 10, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(160, 32, 240, 0.7)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(wisp.x, wisp.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(wisp.x - r * 0.25, wisp.y - r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function drawRift() {
  if (!rift) return;
  ctx.save();
  const pulse = 1 + Math.sin(Date.now() / 400 + rift.phase) * 0.15;
  const r = rift.radius * pulse;
  const urgency = 1 - rift.timer / CONFIG.RIFTS.duration;

  const gradient = ctx.createRadialGradient(rift.x, rift.y, r * 0.1, rift.x, rift.y, r * 1.3);
  gradient.addColorStop(0, 'rgba(69, 243, 255, 0.8)');
  gradient.addColorStop(0.4, `rgba(69, 243, 255, ${0.5 + urgency * 0.3})`);
  gradient.addColorStop(0.7, 'rgba(156, 255, 87, 0.3)');
  gradient.addColorStop(1, 'rgba(156, 255, 87, 0)');
  ctx.fillStyle = gradient;
  ctx.shadowColor = `rgba(69, 243, 255, ${0.6 + urgency * 0.3})`;
  ctx.shadowBlur = 20 + urgency * 10;
  ctx.beginPath();
  ctx.arc(rift.x, rift.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + urgency * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(rift.x, rift.y, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = '10px "Press Start 2P"';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(rift.timer / 1000)}s`, rift.x, rift.y - r - 10);

  ctx.restore();
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function getTreeSize(layer, type = 'guardian') {
  const safeLayer = Math.max(1, Math.min(CONFIG.FOREST.maxLayer, layer));
  const progression = (safeLayer - 1) / (CONFIG.FOREST.maxLayer - 1);
  const initialSize = { width: 65, height: 65 };
  const finalSize = { width: 25, height: 50 };
  const w = initialSize.width - (initialSize.width - finalSize.width) * progression;
  const h = initialSize.height - (initialSize.height - finalSize.height) * progression;
  let size = { width: w, height: h };
  if (type === 'pathfinder') { size.width *= 0.75; size.height *= 0.75; }
  return size;
}

function drawForest() {
  const lvl = getCurrentLevelConfig();
  const safeLayer = Math.max(1, Math.min(CONFIG.FOREST.maxLayer, currentForestLayer || 1));
  const layersInLevel = (lvl.scoreMax - lvl.scoreMin) / CONFIG.FOREST.pointsPerLayer;
  const layerInLevel = Math.max(1, Math.min(layersInLevel, safeLayer - (lvl.scoreMin / CONFIG.FOREST.pointsPerLayer) + 1));
  const progression = (layerInLevel - 1) / (layersInLevel - 1);
  const r = Math.round(lvl.bgStart[0] + (lvl.bgEnd[0] - lvl.bgStart[0]) * progression);
  const g = Math.round(lvl.bgStart[1] + (lvl.bgEnd[1] - lvl.bgStart[1]) * progression);
  const b = Math.round(lvl.bgStart[2] + (lvl.bgEnd[2] - lvl.bgStart[2]) * progression);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  trees.sort((a, b) => (a.type === 'pathfinder' ? 1 : -1) - (b.type === 'pathfinder' ? 1 : -1));
  trees.forEach((tree) => {
    const treeStyle = getTreeSize(safeLayer, tree.type);
    drawSingleTree(tree.x, tree.y, treeStyle, safeLayer, tree.type, tree.glowPhase, lvl, progression);
  });
}

function drawSingleTree(x, y, style, layer, type, glowPhase, lvl, progression) {
  ctx.save();
  ctx.translate(x, y);

  const trunkColor = `rgb(${Math.round(lvl.trunkStart[0] + (lvl.trunkEnd[0] - lvl.trunkStart[0]) * progression)},${Math.round(lvl.trunkStart[1] + (lvl.trunkEnd[1] - lvl.trunkStart[1]) * progression)},${Math.round(lvl.trunkStart[2] + (lvl.trunkEnd[2] - lvl.trunkStart[2]) * progression)})`;
  const canopyColor2 = `rgb(${Math.round(lvl.canopyDarkStart[0] + (lvl.canopyDarkEnd[0] - lvl.canopyDarkStart[0]) * progression)},${Math.round(lvl.canopyDarkStart[1] + (lvl.canopyDarkEnd[1] - lvl.canopyDarkStart[1]) * progression)},${Math.round(lvl.canopyDarkStart[2] + (lvl.canopyDarkEnd[2] - lvl.canopyDarkStart[2]) * progression)})`;
  const canopyColor1 = `rgb(${Math.round(lvl.canopyLightStart[0] + (lvl.canopyLightEnd[0] - lvl.canopyLightStart[0]) * progression)},${Math.round(lvl.canopyLightStart[1] + (lvl.canopyLightEnd[1] - lvl.canopyLightStart[1]) * progression)},${Math.round(lvl.canopyLightStart[2] + (lvl.canopyLightEnd[2] - lvl.canopyLightStart[2]) * progression)})`;

  const pathfinderBaseColor = `rgba(${100 + 40 * progression}, ${120 + 60 * progression}, ${100 + 40 * progression}, 1)`;
  const pathfinderGlow = `rgba(${140 + 40 * progression}, ${180 + 40 * progression}, ${140 + 40 * progression}, ${0.25 + Math.sin(glowPhase + Date.now() / 450) * 0.2})`;

  if (type === 'pathfinder') {
    ctx.fillStyle = pathfinderBaseColor;
    if (layer < CONFIG.FOREST.maxLayer) {
      ctx.shadowColor = pathfinderGlow;
      ctx.shadowBlur = 18 + Math.sin(glowPhase + Date.now() / 450) * 6;
    }
  } else {
    ctx.shadowBlur = 0;
  }

  const detailLevel = Math.floor(1 + progression * 2);
  const trunkWidth = Math.max(6, style.width * 0.28);
  const trunkHeight = style.height * 0.45;

  ctx.fillStyle = trunkColor;
  ctx.fillRect(-trunkWidth / 2, style.height * 0.05, trunkWidth, trunkHeight);

  for (let i = 0; i <= detailLevel; i++) {
    const layerOffset = -i * (style.height * 0.2);
    const layerWidth = style.width * (1 + i * 0.1);
    const layerHeight = style.height * 0.55;
    const color = i % 2 === 0 ? canopyColor1 : canopyColor2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-layerWidth / 2, layerOffset + layerHeight * 0.3);
    ctx.lineTo(-layerWidth * 0.3, layerOffset - layerHeight * 0.15);
    ctx.lineTo(layerWidth * 0.3, layerOffset - layerHeight * 0.15);
    ctx.lineTo(layerWidth / 2, layerOffset + layerHeight * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function checkTreeCollision(checkX, checkY, pRadius) {
  for (const tree of trees) {
    if (tree.type === 'guardian') {
      const treeStyle = getTreeSize(currentForestLayer || 1, tree.type);
      const treeCollisionRadius = Math.max(treeStyle.width, treeStyle.height) / 3.1;
      if (Math.hypot(checkX - tree.x, checkY - tree.y) < pRadius + treeCollisionRadius) return true;
    }
  }
  return false;
}

function movePlayer() {
  if (!player.dx && !player.dy) return;
  let currentSpeed = player.speed;
  if (player.isDashing) currentSpeed *= CONFIG.DASH.speedMultiplier;

  let targetX = player.x + player.dx * (currentSpeed / player.speed);
  let targetY = player.y + player.dy * (currentSpeed / player.speed);
  targetX = Math.max(player.radius, Math.min(gameWidth - player.radius, targetX));
  targetY = Math.max(player.radius, Math.min(gameHeight - player.radius, targetY));

  if (player.dx !== 0) {
    if (!checkTreeCollision(targetX, player.y, player.radius)) player.x = targetX;
  }
  if (player.dy !== 0) {
    if (!checkTreeCollision(player.x, targetY, player.radius)) player.y = targetY;
  }

  if (player.isDashing && (player.dx !== 0 || player.dy !== 0)) {
    if (Math.random() < 0.5) spawnDashTrail(player.x, player.y);
  }
}

function updateWisps(dt) {
  wisps.forEach((wisp) => {
    const dx = player.x - wisp.x;
    const dy = player.y - wisp.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      wisp.x += (dx / dist) * wisp.speed * (dt / 16.7);
      wisp.y += (dy / dist) * wisp.speed * (dt / 16.7);
    }
    if (Math.random() < 0.15) spawnWispTrail(wisp);
  });
}

function handleWispCollision() {
  for (let i = wisps.length - 1; i >= 0; i--) {
    const wisp = wisps[i];
    const dist = Math.hypot(player.x - wisp.x, player.y - wisp.y);
    if (dist < player.radius + wisp.radius) {
      if (player.invulnerable) {
        wisps.splice(i, 1);
        spawnFruitBurst(wisp.x, wisp.y, 'rgba(255, 100, 200, 0.8)');
        continue;
      }
      wisps.splice(i, 1);
      score = Math.max(0, score - getCurrentLevelConfig().wispDamage);
      player.invulnerable = true;
      player.invulnTimer = 1500;
      playWispHitSound();
      getGlitchTaunt();
      spawnFruitBurst(wisp.x, wisp.y, 'rgba(255, 50, 50, 0.8)');
      updateScoreDisplay();
      checkEnvironmentalTransformation();
    }
  }
}

function handleRiftCollision() {
  if (!rift) return;
  const dist = Math.hypot(player.x - rift.x, player.y - rift.y);
  if (dist < player.radius + rift.radius) {
    rift.sealed = true;
    score += rift.reward;
    doubleFruitActive = true;
    doubleFruitTimer = CONFIG.RIFT_BASE.doubleFruitDuration;
    playRiftSealSound();
    spawnRiftSealBurst(rift.x, rift.y);
    showDynamicMessage(`Rift sealed! +${rift.reward} points. Double fruits!`, 3000);

    while (fruits.length < numFruits * 2) spawnFruit();
    updateScoreDisplay();
    checkEnvironmentalTransformation();
    setTimeout(() => { rift = null; }, 500);
  }
}

function showDynamicMessage(message, duration = 4000) {
  dynamicMessageOverlay.textContent = message;
  dynamicMessageOverlay.classList.add('visible');
  setTimeout(() => { dynamicMessageOverlay.classList.remove('visible'); }, duration);
}

function getLoreFragment() {
  if (loreFragments.length > 0) {
    const idx = Math.floor(Math.random() * loreFragments.length);
    showDynamicMessage(` ${loreFragments[idx]}`, 6000);
  } else {
    showDynamicMessage("The forest's whispers are quiet now...", 3000);
  }
}

function getGlitchTaunt() {
  if (aiTaunts.length > 0) {
    const idx = Math.floor(Math.random() * aiTaunts.length);
    showDynamicMessage(`Elon: "${aiTaunts[idx]}"`, 3500);
  } else {
    showDynamicMessage('Elon: My influence spreads...', 3000);
  }
}

function handleFruitCollision() {
  for (let i = fruits.length - 1; i >= 0; i--) {
    const fruit = fruits[i];
    const dist = Math.hypot(player.x - fruit.x, player.y - fruit.y);
    if (dist < player.radius + fruitRadius) {
      spawnFruitBurst(fruit.x, fruit.y, fruit.colorHex);
      fruits.splice(i, 1);
      score += fruit.points;
      if (score >= scoreAtChallengeStart + CONFIG.AI_CHALLENGE.pointsNeeded) {
        aiChallengeTimer = CONFIG.AI_CHALLENGE.duration;
        scoreAtChallengeStart = score;
      }
      if (fruit.isLoreShard) getLoreFragment();
      playCollectSound(fruit.points);
      updateScoreDisplay();
      checkEnvironmentalTransformation();
      spawnFruit();
    }
  }
}

function updateScoreDisplay() {
  const lvl = getCurrentLevelConfig();
  scoreDisplay.textContent = `Score: ${score} / ${CONFIG.FOREST.winningScore}`;
  const levelNameDisplay = document.getElementById('levelNameDisplay');
  if (levelNameDisplay) {
    levelNameDisplay.textContent = lvl.name;
    levelNameDisplay.style.color = ['#45f3ff', '#c084fc', '#ff6b6b'][currentLevel] || '#45f3ff';
  }
}

function checkEnvironmentalTransformation() {
  const newLevel = getLevelForScore(score);
  if (newLevel > currentLevel) {
    triggerLevelTransition(newLevel);
  }

  let targetLayerBasedOnScore = Math.min(CONFIG.FOREST.maxLayer, Math.floor(score / CONFIG.FOREST.pointsPerLayer) + 1);
  if (score >= CONFIG.FOREST.winningScore) targetLayerBasedOnScore = CONFIG.FOREST.maxLayer;
  if (score < 0) targetLayerBasedOnScore = 1;
  if (currentForestLayer < targetLayerBasedOnScore) {
    currentForestLayer = targetLayerBasedOnScore;
    updateAmbientSounds();
  }
  if (score >= CONFIG.FOREST.winningScore && !messageShown) {
    messageDisplay.textContent = "You have saved the EchoVerse from Elon's cold logic. The forest breathes again...";
    messageDisplayContainer.style.display = 'flex';
    messageShown = true;
    gameEnded = true;
    currentForestLayer = CONFIG.FOREST.maxLayer;
    if (aiChallengeTimerDisplay) aiChallengeTimerDisplay.style.display = 'none';
    if (dashCooldownDisplay) dashCooldownDisplay.style.display = 'none';
    updateAmbientSounds();
  } else if (score < CONFIG.FOREST.winningScore && messageShown) {
    messageDisplayContainer.style.display = 'none';
    messageShown = false;
    gameEnded = false;
  }
}

const keysPressed = {};

function handleMovementInput() {
  player.dx = 0;
  player.dy = 0;
  if (keysPressed['arrowright'] || keysPressed['d']) player.dx = player.speed;
  if (keysPressed['arrowleft'] || keysPressed['a']) player.dx = -player.speed;
  if (keysPressed['arrowup'] || keysPressed['w']) player.dy = -player.speed;
  if (keysPressed['arrowdown'] || keysPressed['s']) player.dy = player.speed;
  if (player.dx !== 0 && player.dy !== 0) {
    const factor = player.speed / Math.sqrt(2);
    player.dx = (player.dx > 0 ? 1 : -1) * factor;
    player.dy = (player.dy > 0 ? 1 : -1) * factor;
  }
}

function keyDown(e) {
  if (!gameStarted) return;
  keysPressed[e.key.toLowerCase()] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
    e.preventDefault();
    if (e.key === ' ') actDash();
  }
}

function keyUp(e) {
  keysPressed[e.key.toLowerCase()] = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * (dt / 16.7);
    p.y += p.vy * (dt / 16.7);
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

let lastTimestamp = 0;

function gameLoop(timestamp) {
  if (!gameStarted || gameEnded) {
    if (requestId) cancelAnimationFrame(requestId);
    requestId = null;
    return;
  }
  const deltaTime = timestamp - (lastTimestamp || timestamp);
  lastTimestamp = timestamp;

  if (levelTransition) {
    levelTransition.timer -= deltaTime;
    drawForest();
    drawFruits();
    drawRift();
    drawWisps();
    drawParticles();
    drawPlayer();
    if (levelTransition.timer <= 0) {
      endLevelTransition();
    }
    requestId = requestAnimationFrame(gameLoop);
    return;
  }

  updatePlayerTimers(deltaTime);

  if (score < CONFIG.FOREST.winningScore) {
    aiChallengeTimer -= deltaTime;
    if (aiChallengeTimerDisplay) {
      const secondsLeft = Math.max(0, Math.ceil(aiChallengeTimer / 1000));
      aiChallengeTimerDisplay.textContent = `Corruption in: ${secondsLeft}s`;
    }
    if (aiChallengeTimer <= 0) {
      if (score < scoreAtChallengeStart + CONFIG.AI_CHALLENGE.pointsNeeded) {
        if (currentForestLayer > 1) {
          currentForestLayer--;
          score = Math.max(0, (currentForestLayer - 1) * CONFIG.FOREST.pointsPerLayer);
          updateScoreDisplay();
          getGlitchTaunt();
          updateAmbientSounds();
        }
      }
      aiChallengeTimer = CONFIG.AI_CHALLENGE.duration;
      scoreAtChallengeStart = score;
    }
  } else if (aiChallengeTimerDisplay) {
    aiChallengeTimerDisplay.style.display = 'none';
  }

  wispSpawnTimer -= deltaTime;
  if (wispSpawnTimer <= 0) {
    const lvl = getCurrentLevelConfig();
    wispSpawnTimer = lvl.wispSpawnInterval + Math.random() * 3000;
    spawnWisp();
  }

  riftSpawnTimer -= deltaTime;
  if (riftSpawnTimer <= 0 && !rift) {
    const lvl = getCurrentLevelConfig();
    if (lvl.riftsEnabled) {
      riftSpawnTimer = (lvl.riftSpawnInterval || 35000) + Math.random() * 10000;
      spawnRift();
    }
  }

  if (rift && !rift.sealed) {
    rift.timer -= deltaTime;
    rift.phase += deltaTime * 0.003;
    if (Math.random() < 0.3) spawnRiftParticles(rift);
    if (rift.timer <= 0) {
      for (let i = 0; i < 3; i++) spawnWisp();
      showDynamicMessage('The rift collapsed! Corruption wisps pour through!', 3000);
      rift = null;
    }
  }

  if (doubleFruitActive) {
    doubleFruitTimer -= deltaTime;
    if (doubleFruitTimer <= 0) {
      doubleFruitActive = false;
      while (fruits.length > numFruits) fruits.pop();
    }
  }

  checkEnvironmentalTransformation();
  handleMovementInput();
  movePlayer();
  handleFruitCollision();
  handleWispCollision();
  handleRiftCollision();
  updateWisps(deltaTime);
  updateParticles(deltaTime);

  drawForest();
  drawFruits();
  drawRift();
  drawWisps();
  drawParticles();
  drawPlayer();

  requestId = requestAnimationFrame(gameLoop);
}

function skipOnboarding() {
  currentParagraphIndex = onboardingLines.length;
  const cursor = typewriterContainer.querySelector('.typewriter-cursor');
  if (cursor) cursor.remove();
  typewriterContainer.innerHTML = '';
  onboardingLines.forEach((line, i) => {
    const p = document.createElement('p');
    p.textContent = line;
    p.classList.add('visible-line');
    if (i < onboardingLines.length - 1) p.classList.add('dimmed-line');
    typewriterContainer.appendChild(p);
  });
  beginRestorationButton.classList.add('visible');
  if (soundsReadyForOnboarding && buttonAppearSound)
    buttonAppearSound.triggerAttackRelease('C5', '4n', Tone.now() + 0.1);
}

const skipOnboardingButton = document.getElementById('skipOnboardingButton');
skipOnboardingButton.addEventListener('click', (e) => {
  e.stopPropagation();
  skipOnboarding();
});

onboardingScreen.addEventListener('click', async function initialUserGesture() {
  onboardingScreen.removeEventListener('click', initialUserGesture);
  onboardingScreen.classList.add('no-cursor');
  await initOnboardingAudio();
  typeCharacter();
}, { once: true });
