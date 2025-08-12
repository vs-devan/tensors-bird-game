console.log('api.js loaded');

const API_BASE = 'http://localhost:5000/api'; // change to your backend URL

const signinModal = document.getElementById('signin-modal');
const loginModal = document.getElementById('login-modal');
const startPage = document.getElementById('start-page');
const playButton = document.getElementById('play-button');
const signinButton = document.getElementById('signin-button');
const resumeButton = document.getElementById('resume-button');

const closeSigninBtn = document.getElementById('close-signin');
const closeLoginBtn = document.getElementById('close-login');

const signinForm = document.getElementById('signin-form');
const loginForm = document.getElementById('login-form');

const resultPopup = document.getElementById('result-popup');
const resultDiv = document.getElementById('result');
const popupCloseBtn = document.getElementById('popup-close');

const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');

let currentUser = null;
let authToken = null;

// ----------------- UI Helpers -----------------
function showElement(el) { el.style.display = 'flex'; }
function hideElement(el) { el.style.display = 'none'; }

function showPopup(message) {
  resultDiv.innerHTML = message;
  resultPopup.classList.remove('hidden');
  showElement(resultPopup);
}

function hidePopup() {
  resultPopup.classList.add('hidden');
  hideElement(resultPopup);
}

function showSigninModal() { showElement(signinModal); }
function hideSigninModal() { hideElement(signinModal); }

function showLoginModal() { showElement(loginModal); }
function hideLoginModal() { hideElement(loginModal); }

function enablePlayButton() { playButton.style.display = 'inline-block'; }
function disablePlayButton() { playButton.style.display = 'none'; }



// ===================== Update High Score =====================
export async function updateHighScore(highScore) {
  const secretKey = localStorage.getItem('secretKey'); // stored during login/register

  if (!secretKey) {
    console.warn('No secret key found in localStorage. Cannot update score.');
    return { error: 'Not logged in' };
  }

  try {
    const res = await fetch(`${API_BASE}/users/update-score`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretKey, highScore })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update score');

    console.log('High score update success:', data);
    return data;
  } catch (err) {
    console.error('Error updating high score:', err);
    return { error: err.message };
  }
}



// ----------------- Leaderboard -----------------
async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/users/top10`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const json = await res.json();
    const users = json.data || [];

    leaderboardTableBody.innerHTML = '';
    users.forEach((user, index) => {
      const tr = document.createElement('tr');
      if (index < 5) tr.classList.add('top5');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.name} (${user.department})</td>
        <td>${user.highScore}</td>
        <td>${index < 5 ? '' : '-'}</td>
      `;
      leaderboardTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }
}

// ----------------- Register -----------------
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signin-name-input').value.trim();
  const email = document.getElementById('signin-email-input').value.trim();
  const department = document.getElementById('signin-dept-input').value;

  if (!name || !email || !department) {
    alert('Please fill all fields');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, department })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to register');
      return;
    }

  currentUser = data.data; // backend sends user object as data
authToken = data.secretKey; // store secret key from backend
localStorage.setItem('secretKey', authToken);

    hideSigninModal();
    enablePlayButton();
    startPage.style.display = 'flex';
showPopup(`
  <div style="
    background: #e6ffed;
    border: 1px solid #b7eb8f;
    padding: 15px 20px;
    border-radius: 8px;
    color: #135200;
    font-family: Arial, sans-serif;
    max-width: 350px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  ">
    <h3 style="margin-top: 0; color: #237804;">✅ Successfully Registered!</h3>
    <p style="margin: 6px 0;"><b>Name:</b> ${currentUser.name}</p>
    <p style="margin: 6px 0;"><b>Email:</b> ${currentUser.email}</p>
    <p style="margin: 6px 0; background: #fffbe6; padding: 5px 8px; border-radius: 5px; border: 1px dashed #faad14;">
      <b>Secret Key:</b> ${authToken}
    </p>
    <small style="color: #8c8c8c;">💾 Save this key to resume your game later.</small>
  </div>
`);


    fetchLeaderboard();
  } catch (err) {
    alert('Registration error: ' + err.message);
  }
});

// ----------------- Login -----------------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const secretKey = document.getElementById('login-secret-input').value.trim();
  if (!secretKey) {
    alert('Please enter your Secret Key');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ secretKey }) // must match backend field name
    });

    const data = await res.json();
    console.log('Login response:', data);

    if (!res.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    currentUser = data.data || data.user;
    authToken = secretKey;
localStorage.setItem('secretKey', authToken);
    hideLoginModal();
    enablePlayButton();
    startPage.style.display = 'flex';

    showPopup(`Welcome back ${currentUser.name}! You can now play your game.`);

    fetchLeaderboard();
  } catch (err) {
    alert('Login error: ' + err.message);
  }
});

// ----------------- Button Listeners -----------------
signinButton.addEventListener('click', () => {
  showSigninModal();
  hideLoginModal();
  hidePopup();
  disablePlayButton();
});

resumeButton.addEventListener('click', () => {
  showLoginModal();
  hideSigninModal();
  hidePopup();
  disablePlayButton();
});

// ✅ Play button — dynamic import to avoid circular dependency issue
playButton.addEventListener('click', async () => {
  hideSigninModal();
  hideLoginModal();
  hidePopup();
  startPage.style.display = 'none';
  document.getElementById('game-canvas').style.display = 'block';
  document.getElementById('hud').style.display = 'block';

  const { startGame } = await import('./game.js');
  startGame(currentUser, authToken);
});

// Close modal buttons
closeSigninBtn.addEventListener('click', () => {
  hideSigninModal();
  enablePlayButton();
  startPage.style.display = 'flex';
});

closeLoginBtn.addEventListener('click', () => {
  hideLoginModal();
  enablePlayButton();
  startPage.style.display = 'flex';
});

// Close popup button
popupCloseBtn.addEventListener('click', () => { hidePopup(); });

// ----------------- Init -----------------
window.addEventListener('load', () => {
  disablePlayButton();
  hideSigninModal();
  hideLoginModal();
  hidePopup();
  fetchLeaderboard();
});
