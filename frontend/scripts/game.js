// Tap to start overlay
let tapToStartOverlay = document.createElement('div');
tapToStartOverlay.id = 'tap-to-start-overlay';
tapToStartOverlay.style.position = 'fixed';
tapToStartOverlay.style.top = '0';
tapToStartOverlay.style.left = '0';
tapToStartOverlay.style.width = '100vw';
tapToStartOverlay.style.height = '100vh';
tapToStartOverlay.style.display = 'flex';
tapToStartOverlay.style.alignItems = 'center';
tapToStartOverlay.style.justifyContent = 'center';
tapToStartOverlay.style.background = 'rgba(0,0,0,0.3)';
tapToStartOverlay.style.zIndex = '9999';
tapToStartOverlay.style.fontSize = '2.5rem';
tapToStartOverlay.style.color = '#2eb191';
tapToStartOverlay.style.fontWeight = 'bold';
tapToStartOverlay.style.fontFamily = 'Arial, sans-serif';
tapToStartOverlay.style.pointerEvents = 'auto';
tapToStartOverlay.style.textAlign = 'center';
tapToStartOverlay.style.borderRadius = '12px';
tapToStartOverlay.style.padding = '0';
tapToStartOverlay.textContent = 'Tap to start';

let waitingToStart = false;

// Countdown overlay element

let countdownOverlay = document.createElement('div');
countdownOverlay.id = 'countdown-overlay';
countdownOverlay.style.position = 'fixed';
countdownOverlay.style.top = '0';
countdownOverlay.style.left = '0';
countdownOverlay.style.width = '100vw';
countdownOverlay.style.height = '100vh';
countdownOverlay.style.display = 'flex';
countdownOverlay.style.alignItems = 'center';
countdownOverlay.style.justifyContent = 'center';
countdownOverlay.style.background = 'rgba(0,0,0,0.3)';
countdownOverlay.style.zIndex = '9999';
countdownOverlay.style.fontSize = '2rem';
countdownOverlay.style.color = '#dbdbdaff';
countdownOverlay.style.fontWeight = 'bold';
countdownOverlay.style.fontFamily = 'Arial, sans-serif';
countdownOverlay.style.pointerEvents = 'none';
countdownOverlay.style.textAlign = 'center';
countdownOverlay.style.borderRadius = '12px';
countdownOverlay.style.padding = '0';

function showCountdown(callback) {
  let count = 3;
  countdownOverlay.textContent = `Resuming in ${count}...`;
  document.body.appendChild(countdownOverlay);
  let interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownOverlay.textContent = `Resuming in ${count}...`;
    } else {
      clearInterval(interval);
      document.body.removeChild(countdownOverlay);
      if (callback) callback();
    }
  }, 700);
}
console.log('Starting game.js import');

import { isMobile } from './utils.js';
import { updateHighScore } from './api.js';

console.log('game.js imports successful');

const canvas = document.getElementById('game-canvas');
const ctx = canvas && canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverModal = document.getElementById('game-over-modal');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const referralButton = document.getElementById('referral-button');
const menuButton = document.getElementById('menu-button');
const hud = document.getElementById('hud');
const milestoneModal = document.getElementById('milestone-modal');
const closeMilestone = document.getElementById('close-milestone');
const milestoneForm = document.getElementById('milestone-form');
const milestoneNameInput = document.getElementById('milestone-name-input');
const milestoneEmailInput = document.getElementById('milestone-email-input');
const milestonePhoneInput = document.getElementById('milestone-phone-input');
const referModal = document.getElementById('refer-modal');
const closeRefer = document.getElementById('close-refer');

if (!canvas || !ctx) console.error('Canvas or context not initialized');
if (!scoreDisplay) console.error('Score display not found');
if (!gameOverModal) console.error('Game over modal not found');
if (!restartButton) console.error('Restart button not found');
if (!referralButton) console.error('Referral button not found');
if (!menuButton) console.error('Menu button not found');

const birdImg = new Image(); birdImg.src = 'assets/tensors-logo-running.png';
const pipeTopImg = new Image(); pipeTopImg.src = 'assets/tower-top.svg';
const pipeBottomImg = new Image(); pipeBottomImg.src = 'assets/tower-bottom.svg';
const obstructionImg = new Image(); obstructionImg.src = 'assets/code-bug.png';

birdImg.onload = () => console.log('Bird image loaded');
pipeTopImg.onload = () => console.log('Pipe top image loaded');
pipeBottomImg.onload = () => console.log('Pipe bottom image loaded');
obstructionImg.onload = () => console.log('Obstruction image loaded');
birdImg.onerror = () => console.error('Bird image failed to load');
pipeTopImg.onerror = () => console.error('Pipe top image failed to load');
pipeBottomImg.onerror = () => console.error('Pipe bottom image failed to load');
obstructionImg.onerror = () => console.error('Obstruction image failed to load');

// Web Audio API for sounds (low latency)
const audioContext = new AudioContext();

async function loadAudio(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Audio load error:', error);
    return null;
  }
}

const flapBufferPromise = loadAudio('assets/flap-sound.mp3');
const failBufferPromise = loadAudio('assets/fail-sound.mp3');
const congratsBufferPromise = loadAudio('assets/congrats-sound.mp3');

let currentAudioSource = null;
async function playSound(bufferPromise) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  bufferPromise.then(buffer => {
    if (buffer) {
      if (currentAudioSource) {
        try { currentAudioSource.stop(); } catch (e) {}
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      currentAudioSource = source;
      source.onended = () => { currentAudioSource = null; };
    }
  }).catch(error => console.error('Play sound error:', error));
}

let score = 0;
let isGameOver = false;
let isPaused = false;
let birdY = canvas ? canvas.height / 2 : 0;
let birdVelocity = 0;
let gravity = 0.5;
let flapStrength = -10;
let rotation = 0;
let obstacles = [];
let obstructions = [];
let lives = 1;
let extraLifeUsed = false;
let pipeSpeed = 5;

const birdX = 100;
const birdSize = 40;
const pipeWidth = 60;
const pipeGap = 150;
const pipeMinHeight = 100;
const pipeSpacing = 5000;
const obstructionSize = 30;

let lastPipeSpawn = 0;

function updateLivesDisplay() {
  const livesDisplay = document.getElementById('lives-display');
  if (livesDisplay) livesDisplay.innerText = `Lives: ${lives}`;
}


function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    birdY = canvas.height / 2;
    console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

if (isMobile()) {
  console.log('Mobile controls enabled');
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isGameOver && !isPaused) {
      birdVelocity = flapStrength;
      rotation = -20;
      playSound(flapBufferPromise);
      console.log('Touchstart: Bird flapping, velocity=', birdVelocity, 'rotation=', rotation);
    }
  });
} else {
  console.log('Desktop controls enabled');
  document.addEventListener('keydown', (e) => {
    if (!isGameOver && !isPaused) {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        birdVelocity = flapStrength;
        rotation = -20;
        playSound(flapBufferPromise);
        console.log(`${e.key} pressed: Bird flapping, velocity=`, birdVelocity, 'rotation=', rotation);
      }
    }
  });
}


let animationFrameId = null;
let lastFrameTime = null;

function gameLoop(timestamp = 0) {
  if (isGameOver || isPaused || !ctx) {
    console.log(`Game loop stopped: isGameOver=${isGameOver}, isPaused=${isPaused}, ctx=${!!ctx}`);
    return;
  }

  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = (timestamp - lastFrameTime) / 1000; // seconds
  lastFrameTime = timestamp;

  // Clamp deltaTime to avoid huge jumps (e.g. tab switch)
  const dt = Math.min(deltaTime, 0.05); // max 50ms/frame

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Increase speed based on score
  pipeSpeed = 5 + Math.floor(score / 1000);

  // Physics: scale by dt
  birdVelocity += gravity * dt * 60; // gravity per second
  birdY += birdVelocity * dt * 60;   // velocity per second
  rotation = Math.min(Math.max(birdVelocity * 3, -20), 90);
  console.log(`Bird updated: y=${birdY}, velocity=${birdVelocity}, rotation=${rotation}`);

  ctx.save();
  ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.drawImage(birdImg, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
  ctx.restore();
  console.log(`Bird drawn: x=${birdX}, y=${birdY}, rotation=${rotation}`);

  // Pipe spawn logic: use time instead of frame count
  if ((timestamp - lastPipeSpawn > pipeSpacing / pipeSpeed * 0.8) && Math.random() < 0.04) {
    const dynamicGap = Math.max(80, pipeGap - Math.floor(score / 200)); // Minimum gap is 80
    const gapY = Math.random() * (canvas.height - dynamicGap - 2 * pipeMinHeight) + pipeMinHeight;
    obstacles.push({ x: canvas.width, gapY, cleared: false, gap: dynamicGap });
    lastPipeSpawn = timestamp;
    console.log(`Pipe spawned: x=${canvas.width}, gapY=${gapY}`);
  }

  obstacles.forEach((obs, i) => {
    const gap = obs.gap || pipeGap;
    obs.x -= pipeSpeed * dt * 60; // move per second
    ctx.drawImage(pipeTopImg, obs.x, obs.gapY - gap / 2 - canvas.height, pipeWidth, canvas.height);
    ctx.drawImage(pipeBottomImg, obs.x, obs.gapY + gap / 2, pipeWidth, canvas.height);
    console.log(`Pipe drawn: x=${obs.x}, gapY=${obs.gapY}`);

    const birdCenterX = birdX + birdSize / 2;
    const birdCenterY = birdY + birdSize / 2;
    const birdRadius = birdSize / 2;
    const topPipeHitbox = { x: obs.x, y: obs.gapY - pipeGap / 2 - canvas.height, w: pipeWidth, h: canvas.height };
    const bottomPipeHitbox = { x: obs.x, y: obs.gapY + pipeGap / 2, w: pipeWidth, h: canvas.height };
    if (circleRectCollides(birdCenterX, birdCenterY, birdRadius, topPipeHitbox) || circleRectCollides(birdCenterX, birdCenterY, birdRadius, bottomPipeHitbox)) {
      console.log('Collision: Bird hit pipe');
      playSound(failBufferPromise);
      endGame();
    }

    if (obs.x + pipeWidth < birdX && !obs.cleared) {
      score += 100;
      obs.cleared = true;
      console.log('Pipe cleared: +50 points');
    }

    if (obs.x < -pipeWidth) {
      obstacles.splice(i, 1);
      console.log('Pipe removed: off-screen');
    }
  });

  // Obstruction spawn logic: use dt for movement
  if (Math.random() < 0.005) {
    const obsY = Math.random() * (canvas.height - obstructionSize);
    obstructions.push({ x: canvas.width, y: obsY });
    console.log(`Obstruction spawned: x=${canvas.width}, y=${obsY}`);
  }
  obstructions.forEach((obs, i) => {
    obs.x -= pipeSpeed * dt * 60; // move per second
    ctx.drawImage(obstructionImg, obs.x, obs.y, obstructionSize, obstructionSize);
    console.log(`Obstruction drawn: x=${obs.x}, y=${obs.y}`);

    const birdCenterX = birdX + birdSize / 2;
    const birdCenterY = birdY + birdSize / 2;
    const birdRadius = birdSize / 2;
    const obsHitbox = { x: obs.x, y: obs.y, w: obstructionSize, h: obstructionSize };
    if (circleRectCollides(birdCenterX, birdCenterY, birdRadius, obsHitbox)) {
      console.log('Collision: Bird hit obstruction');
      playSound(failBufferPromise);
      endGame();
    }

    if (obs.x < -obstructionSize) {
      obstructions.splice(i, 1);
      console.log('Obstruction removed: off-screen');
    }
  });

  if (birdY > canvas.height - birdSize || birdY < 0) {
    console.log('Collision: Bird hit ground/ceiling');
    playSound(failBufferPromise);
    endGame();
  }

  // Score: scale by dt so score increases at same rate
  score += Math.round(dt * 60); // 60 points per second
  scoreDisplay.textContent = `Score: ${score} | Lives: ${lives}`;
  console.log(`Score updated: score=${score}, lives=${lives}`);

  if (score >= 1000 && !milestoneShown) {
    console.log('Milestone reached: 1000 points');
    playSound(congratsBufferPromise);
    showMilestone();
    milestoneShown = true;
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

function circleRectCollides(cx, cy, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

let milestoneShown = false;
function showMilestone() {
  isPaused = true;
  milestoneModal.style.display = 'flex';
    confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#2eb191', '#ffd700', '#ff4d4d'],
  });
  console.log('Confetti triggered on milestone close');
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    milestoneNameInput.value = user.name || '';
    milestoneEmailInput.value = user.email || '';
  }
  console.log('Milestone modal shown');
}

closeMilestone.addEventListener('click', () => {
  milestoneModal.style.display = 'none';
  isPaused = false;
  milestoneShown = true;
  console.log('Milestone modal closed');
  // Show countdown before resuming game
  showCountdown(() => {
    resetGame(false, score);
  });
});

function endGame() {
  lives--;
  console.log(`Life lost: lives=${lives}`);
  updateLivesDisplay(); // Make sure you have this helper to refresh UI

  if (lives <= 0) {
    lives = 0;
    isGameOver = true;
    finalScore.textContent = score;
    gameOverModal.style.display = 'flex';

    // Show refer button only if not referred before
    referralButton.style.display = sessionStorage.getItem('referred') ? 'none' : 'block';

    // Set up referral click event
    referralButton.onclick = () => {
  const gameLink = "https://tensors-bird-game.netlify.app/";
  const message = encodeURIComponent(`Hey! Try this awesome game by Tensors and stand a chance to get selected for direct interview to the team: ${gameLink}`);
  window.open(`https://wa.me/?text=${message}`, '_blank');
  setTimeout(() => {
    if (!sessionStorage.getItem('referred')) {
      sessionStorage.setItem('referred', 'true');
      if (!extraLifeUsed) {
        lives = 1;
        extraLifeUsed = true;
        gameOverModal.style.display = 'none';
        referModal.querySelector('h2').textContent = 'Congratulations!';
        referModal.querySelector('p').textContent = 'Extra life granted!';
        referModal.style.display = 'flex';
        isPaused = true;
        referralButton.style.display = 'none';
        updateLivesDisplay();
      } else {
        gameOverModal.style.display = 'none';
        referModal.querySelector('h2').textContent = 'Congratulations!';
        referModal.querySelector('p').textContent = 'Extra life granted!';
        referModal.style.display = 'flex';
        isPaused = true;
        referralButton.style.display = 'none';
      }
    } else {
      gameOverModal.style.display = 'none';
      referModal.querySelector('h2').textContent = 'Congratulations!';
      referModal.querySelector('p').textContent = 'Extra Life granted!';
      referModal.style.display = 'flex';
      isPaused = true;
      referralButton.style.display = 'none';
    }
  }, 1500);
};


    console.log('Game over: modal shown');

    const user = JSON.parse(localStorage.getItem('user'));

    // Use localStorage stored secretKey automatically
    updateHighScore(score).then(response => {
      if (response.error) {
        console.warn('Failed to update score:', response.error);
      } 
    });

  } else {
    resetGame(false, 0);
  }
}

restartButton.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
  sessionStorage.removeItem('referred');
  console.log('Restart button clicked, referral reset');
  resetGame(true, 0);
});

referralButton.addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.email === 'anonymous') {
    console.log('Referral skipped: No user logged in');
    return;
  }
  if (!sessionStorage.getItem('referred')) {
    sessionStorage.setItem('referred', 'true');
    if (!extraLifeUsed) {
      lives = 1;
      extraLifeUsed = true;
      referralButton.style.display = 'none';
      // Add delay before showing modal
      setTimeout(() => {
        referModal.style.display = 'flex';
        isPaused = true;
      }, 2000); // 1.5 second delay
    } else {
      referralButton.style.display = 'none';
    }
  } else {
    alert('Extra Life Granted.');
  }
});

closeRefer.addEventListener('click', () => {
  referModal.style.display = 'none';
  isPaused = false;
  isGameOver = false; // <-- Allow game to restart after referral
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch (e) {}
    currentAudioSource = null;
  }
  // Show countdown before resuming game
  showCountdown(() => {
    resetGame(false, score);
  });
});

menuButton.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
  canvas.style.display = 'none';
  hud.style.display = 'none';
  document.getElementById('start-page').style.display = 'flex';
  isGameOver = true;
  sessionStorage.removeItem('referred');
  pipeSpeed = 5;
  console.log('Back to menu clicked, game stopped, referral reset');
});

// Always reset pipeSpeed when starting or resetting the game
function resetGame(clearLives = true, score1 = 0) {
  // Cancel previous animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch (e) {}
    currentAudioSource = null;
  }
  score = score1;
  obstacles = [];
  obstructions = [];
  birdY = canvas.height / 2;
  birdVelocity = 0;
  rotation = 0;
  pipeSpeed = 5; // <-- Always reset speed here
  isGameOver = false;
  milestoneShown = false;
  lastPipeSpawn = 0;
  lastFrameTime = null; // Reset frame time for delta timing
  if (clearLives) {
    lives = 1;
    extraLifeUsed = false;
  } else {
    extraLifeUsed = true;
  }
  if (score >= 1000) {
    milestoneShown = true;
  }
  scoreDisplay.textContent = `Score: ${score} | Lives: ${lives}`;
  console.log(`Game reset: clearLives=${clearLives}, lives=${lives}, pipeSpeed=${pipeSpeed}`);
  gameLoop();
}

function startGame() {
  console.log('startGame called');
  if (!canvas || !ctx) {
    console.error('Cannot start game: Canvas or context missing');
    return;
  }
  // Cancel previous animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  pipeSpeed = 5; // <-- Always reset speed here too
  resizeCanvas();
  resetGame(true);

  // Show tap to start overlay
  waitingToStart = true;
  document.body.appendChild(tapToStartOverlay);

  function startOnInput() {
    if (!waitingToStart) return;
    waitingToStart = false;
    if (document.body.contains(tapToStartOverlay)) {
      document.body.removeChild(tapToStartOverlay);
    }
    gameLoop();
    // Remove listeners after start
    canvas.removeEventListener('touchstart', startOnInput);
    document.removeEventListener('keydown', startOnInput);
    canvas.removeEventListener('mousedown', startOnInput);
  }

  // Listen for tap/click or key press
  canvas.addEventListener('touchstart', startOnInput);
  canvas.addEventListener('mousedown', startOnInput);
  document.addEventListener('keydown', startOnInput);
}

export { startGame };



