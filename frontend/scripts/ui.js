console.log('Starting ui.js import');

import { getDepartment, isValidIITMEmail, isMobile } from './utils.js';
import { fetchLeaderboard } from './api.js';
import { startGame } from './game.js';

console.log('ui.js imports successful');

const startPage = document.getElementById('start-page');
const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const playButton = document.getElementById('play-button');
const signinButton = document.getElementById('signin-button');
const signinModal = document.getElementById('signin-modal');
const signinForm = document.getElementById('signin-form');
const signinNameInput = document.getElementById('signin-name-input');
const signinEmailInput = document.getElementById('signin-email-input');
const closeSignin = document.getElementById('close-signin');
const leaderboardBody = document.querySelector('#leaderboard-table tbody');

// Newly added
const restartButton = document.getElementById('restart-button');
const gameOverScreen = document.getElementById('game-over-screen');
const gameCanvas = document.getElementById('game-canvas');

if (!startPage) console.error('Start page not found in DOM');
if (!canvas) console.error('Game canvas not found in DOM');
if (!hud) console.error('HUD not found in DOM');
if (!playButton) console.error('Play button not found in DOM');
if (!signinButton) console.error('Signin button not found in DOM');
if (!signinModal) console.error('Signin modal not found in DOM');
if (!leaderboardBody) console.error('Leaderboard body not found in DOM');
if (!restartButton) console.error('Restart button not found in DOM');
if (!gameOverScreen) console.error('Game over screen not found in DOM');

async function loadLeaderboard() {
  console.log('loadLeaderboard called');

  try {
    const leaderboardData = await fetchLeaderboard(); // Call API function

    leaderboardBody.innerHTML = '';
    leaderboardData.forEach((entry, index) => {
      const row = document.createElement('tr');
      if (index < 5 && isValidIITMEmail(entry.email)) {
        row.classList.add('top5');
      }
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name} (${entry.department})</td>
        <td>${entry.highScore}</td>
        <td>${index < 10 && isValidIITMEmail(entry.email) ? '' : ''}</td>
      `;
      leaderboardBody.appendChild(row);
    });

    console.log('Leaderboard populated from API');
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
}

loadLeaderboard();

signinButton.addEventListener('click', () => {
  console.log('Signin button clicked');
  signinModal.style.display = 'flex';
});

signinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Signin form submitted');
  const name = signinNameInput.value.trim();
  const email = signinEmailInput.value.trim();

  if (!name || !email) {
    alert('Please enter both name and email to login.');
    console.log('Signin failed: Missing name or email');
    return;
  }
  if (!isValidIITMEmail(email)) {
    alert('Please use a valid IIT Madras email (e.g., @smail.iitm.ac.in or @iitm.ac.in).');
    console.log('Signin failed: Invalid email');
    return;
  }

  const department = getDepartment(email);
  localStorage.setItem('user', JSON.stringify({ name, email, department }));
  alert('Login successful! Your scores will appear on the leaderboard.');
  console.log('Signin successful:', { name, email, department });
  signinModal.style.display = 'none';
  loadLeaderboard();
});

closeSignin.addEventListener('click', () => {
  signinModal.style.display = 'none';
  console.log('Signin modal closed');
});

playButton.addEventListener('click', () => {
  console.log('Play button clicked');
  try {
    startPage.style.display = 'none';
    canvas.style.display = 'block';
    hud.style.display = 'flex';
    console.log('Starting game...');
    startGame();
  } catch (error) {
    console.error('Error starting game:', error);
    alert('Failed to start game. Check console for details.');
    startPage.style.display = 'flex';
    canvas.style.display = 'none';
    hud.style.display = 'none';
  }
});

const particlesCanvas = document.getElementById('particles-canvas');
const particlesCtx = particlesCanvas && particlesCanvas.getContext('2d');
if (!particlesCanvas) console.error('Particles canvas not found');
else particlesCanvas.style.display = 'block'; // Make sure it's visible

let particles = [];

function createParticles() {
  particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      color: `rgba(46, 177, 145, ${Math.random() * 0.5 + 0.2})`
    });
  }
  console.log('Particles created:', particles.length);
}

function drawParticles() {
  if (!particlesCtx) return;
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  particles.forEach(p => {
    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    particlesCtx.fillStyle = p.color;
    particlesCtx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > particlesCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > particlesCanvas.height) p.vy *= -1;
  });
  requestAnimationFrame(drawParticles);
}

function resizeParticles() {
  if (particlesCanvas) {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    console.log(`Particles canvas resized: ${particlesCanvas.width}x${particlesCanvas.height}`);
    createParticles();
    if (particlesCtx) drawParticles();
  }
}

window.addEventListener('resize', resizeParticles);

createParticles();
if (particlesCtx) drawParticles();
resizeParticles();

// Restart button
if (restartButton) {
  restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    startGame();
  });
}

export { startGame };
