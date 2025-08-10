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

if (!startPage) console.error('Start page not found in DOM');
if (!canvas) console.error('Game canvas not found in DOM');
if (!hud) console.error('HUD not found in DOM');
if (!playButton) console.error('Play button not found in DOM');
if (!signinButton) console.error('Signin button not found in DOM');
if (!signinModal) console.error('Signin modal not found in DOM');
if (!leaderboardBody) console.error('Leaderboard body not found in DOM');

async function loadLeaderboard() {
  console.log('loadLeaderboard called');
  // Dummy data for testing
  const dummyData = [
    { name: 'Alice', department: 'CS', highScore: 1500, email: 'cs@smail.iitm.ac.in' },
    { name: 'Bob', department: 'EE', highScore: 1400, email: 'ee@smail.iitm.ac.in' },
    { name: 'Charlie', department: 'ME', highScore: 1300, email: 'me@smail.iitm.ac.in' },
    { name: 'David', department: 'ED', highScore: 1200, email: 'ed@smail.iitm.ac.in' },
    { name: 'Emma', department: 'CH', highScore: 1100, email: 'ch@smail.iitm.ac.in' },
    { name: 'Frank', department: 'CS', highScore: 1000, email: 'cs@smail.iitm.ac.in' },
    { name: 'Grace', department: 'CE', highScore: 900, email: 'ce@smail.iitm.ac.in' },
    { name: 'Henry', department: 'BT', highScore: 800, email: 'bt@smail.iitm.ac.in' },
    { name: 'Ivy', department: 'EE', highScore: 700, email: 'ee@smail.iitm.ac.in' },
    { name: 'Jack', department: 'CS', highScore: 600, email: 'cs@smail.iitm.ac.in' }
  ];
  leaderboardBody.innerHTML = '';
  dummyData.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.classList.add(index < 5 && isValidIITMEmail(entry.email) ? 'top5' : '');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name} (${entry.department})</td>

      <td>${entry.highScore}</td>
      <td>${index < 10 && isValidIITMEmail(entry.email) ? '' : ''}</td>
    `;
    leaderboardBody.appendChild(row);
  });
  console.log('Leaderboard populated with dummy data');
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
if (!particlesCtx) console.error('Particles canvas context not found');

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
  }
}

window.addEventListener('resize', () => {
  resizeParticles();
});

createParticles();
if (particlesCtx) drawParticles();
resizeParticles();

restartButton.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  gameCanvas.style.display = 'block';
  startGame();
});


export { startGame };