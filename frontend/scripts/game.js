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
const milestoneModal = document.getElementById('milestone-modal');
const closeMilestone = document.getElementById('close-milestone');
const milestoneForm = document.getElementById('milestone-form');
const milestoneNameInput = document.getElementById('milestone-name-input');
const milestoneEmailInput = document.getElementById('milestone-email-input');
const milestonePhoneInput = document.getElementById('milestone-phone-input');

if (!canvas || !ctx) console.error('Canvas or context not initialized');
if (!scoreDisplay) console.error('Score display not found');
if (!gameOverModal) console.error('Game over modal not found');
if (!restartButton) console.error('Restart button not found');
if (!referralButton) console.error('Referral button not found');
if (!menuButton) console.error('Menu button not found');
if (!milestoneModal) console.error('Milestone modal not found');
if (!milestoneForm) console.error('Milestone form not found');
if (!milestoneNameInput) console.error('Milestone name input not found');
if (!milestoneEmailInput) console.error('Milestone email input not found');
if (!milestonePhoneInput) console.error('Milestone phone input not found');

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

function playSound(bufferPromise) {
  bufferPromise.then(buffer => {
    if (buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
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
const obstructionSpeed = 5;


let lastPipeSpawn = 0;

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

function gameLoop(timestamp = 0) {
  if (isGameOver || isPaused || !ctx) {
    console.log(`Game loop stopped: isGameOver=${isGameOver}, isPaused=${isPaused}, ctx=${!!ctx}`);
    return;
  }

  console.log('Game loop running');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  birdVelocity += gravity;
  birdY += birdVelocity;
  rotation = Math.min(Math.max(birdVelocity * 3, -20), 90);
  console.log(`Bird updated: y=${birdY}, velocity=${birdVelocity}, rotation=${rotation}`);

  ctx.save();
  ctx.translate(birdX + birdSize / 2, birdY + birdSize / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.drawImage(birdImg, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
  ctx.restore();
  console.log(`Bird drawn: x=${birdX}, y=${birdY}, rotation=${rotation}`);

  pipeSpeed = 5 + Math.floor(score / 500);
  console.log(`Pipe speed updated: ${pipeSpeed}`);

  if ((timestamp - lastPipeSpawn > pipeSpacing / pipeSpeed * 5) && Math.random() < 0.08) {
    const gapY = Math.random() * (canvas.height - pipeGap - 2 * pipeMinHeight) + pipeMinHeight;
    obstacles.push({ x: canvas.width, gapY, cleared: false });
    lastPipeSpawn = timestamp;
    console.log(`Pipe spawned: x=${canvas.width}, gapY=${gapY}`);
  }

  obstacles.forEach((obs, i) => {
    obs.x -= pipeSpeed;
    ctx.drawImage(pipeTopImg, obs.x, obs.gapY - pipeGap / 2 - canvas.height, pipeWidth, canvas.height);
    ctx.drawImage(pipeBottomImg, obs.x, obs.gapY + pipeGap / 2, pipeWidth, canvas.height);
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
      score += 50;
      obs.cleared = true;
      console.log('Pipe cleared: +50 points');
    }

    if (obs.x < -pipeWidth) {
      obstacles.splice(i, 1);
      console.log('Pipe removed: off-screen');
    }
  });

  if (Math.random() < 0.005) {
    const obsY = Math.random() * (canvas.height - obstructionSize);
    obstructions.push({ x: canvas.width, y: obsY });
    console.log(`Obstruction spawned: x=${canvas.width}, y=${obsY}`);
  }
  obstructions.forEach((obs, i) => {
    obs.x -= obstructionSpeed;
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

  score += 1;
  scoreDisplay.textContent = `Score: ${score} | Lives: ${lives}`;
  console.log(`Score updated: score=${score}, lives=${lives}`);

  if (score >= 1000 && !milestoneShown) {
    console.log('Milestone reached: 1000 points');
    playSound(congratsBufferPromise);
    showMilestone();
    milestoneShown = true;
  }

  requestAnimationFrame(gameLoop);
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
    startReviveTimer();
    milestoneModal.style.display = 'none';
  isPaused = false;
  console.log('Milestone modal closed');
  gameLoop();
});

milestoneForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Milestone form submitted');
  const name = milestoneNameInput.value.trim();
  const email = milestoneEmailInput.value.trim();
  const phone = milestonePhoneInput.value.trim();

  if (!name || !email || !phone) {
    alert('Please enter name, email, and phone.');
    console.log('Milestone submission failed: Missing fields');
    return;
  }
  if (!isValidIITMEmail(email)) {
    alert('Please use a valid IIT Madras email.');
    console.log('Milestone submission failed: Invalid email');
    return;
  }

  const department = getDepartment(email);
  localStorage.setItem('user', JSON.stringify({ name, email, department }));
  milestoneModal.style.display = 'none';
  // Trigger confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#2eb191', '#ffd700', '#ff4d4d'],
  });
  console.log('Confetti triggered for milestone submission');
  isPaused = false;
  gameLoop();
});

function endGame() {
  lives--;
  console.log(`Life lost: lives=${lives}`);
  if (lives <= 0) {
    isGameOver = true;
    finalScore.textContent = score;
    gameOverModal.style.display = 'flex';
    referralButton.style.display = sessionStorage.getItem('referred') ? 'none' : 'block';
    console.log('Game over: modal shown');
    const user = JSON.parse(localStorage.getItem('user'));
  // Use localStorage stored secretKey automatically
updateHighScore(score).then(response => {
  if (response.error) {
    console.warn('Failed to update score:', response.error);
  } else {
    alert('High score updated successfully!');
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
    //alert('Please login to refer a friend.');
    return;
  }
  if (!sessionStorage.getItem('referred')) {
    sessionStorage.setItem('referred', 'true');
    if (!extraLifeUsed) {
      lives = 1;
      extraLifeUsed = true;
      console.log('Referral successful: Extra life granted');
      alert('Shared! You gained an extra life.');
      referralButton.style.display = 'none';
      startReviveTimer();
    } else {
      console.log('Referral successful: Extra life already used');
      alert('Shared! Extra life already used this session.');
    }
    referralButton.style.display = 'none';
  } else {
    console.log('Referral skipped: Already referred this session');
    alert('You already referred this session.');
  }
});

function startReviveTimer() {
    isPaused = true;
  gameOverModal.classList.add('revive-glow');
  let countdown = 3;
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'revive-timer';
  timerDisplay.textContent = `Reviving in ${countdown}...`;
  gameOverModal.parentNode.appendChild(timerDisplay);

  const interval = setInterval(() => {
    countdown--;
    timerDisplay.textContent = `Reviving in ${countdown}...`;
    if (countdown <= 0) {
      clearInterval(interval);
      gameOverModal.parentNode.removeChild(timerDisplay);
      gameOverModal.style.display = 'none';
      gameOverModal.classList.remove('revive-glow');
      isPaused = false;
      resetGame(true, score);
      gameLoop();
    }
  }, 1000);
}

menuButton.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
  canvas.style.display = 'none';
  hud.style.display = 'none';
  document.getElementById('start-page').style.display = 'flex';
  isGameOver = true;
  sessionStorage.removeItem('referred');
  console.log('Back to menu clicked, game stopped, referral reset');
});

function resetGame(clearLives = true, score1 = 0) {
  score = score1;
  obstacles = [];
  obstructions = [];
  birdY = canvas.height / 2;
  birdVelocity = 0;
  rotation = 0;
  pipeSpeed = 5;
  isGameOver = false;
  milestoneShown = false;
  lastPipeSpawn = 0;
  if (clearLives) {
    lives = 1;
    extraLifeUsed = false;
  } else {
    extraLifeUsed = true;
} // Keep extra life used status
    if (score >= 1000) {
      milestoneShown = true; // Reset lives only if score is 1000 or more
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
  resizeCanvas();
  resetGame(true);
}

export { startGame };



