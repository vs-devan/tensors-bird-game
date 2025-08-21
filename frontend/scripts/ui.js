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
      // Only show first 6 rows, hide the rest by default
      if (index < 6) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
      leaderboardBody.appendChild(row);
    });

    // Make the table scrollable and reveal hidden rows on scroll
    const leaderboardTable = document.getElementById('leaderboard-table');
    leaderboardTable.parentElement.style.maxHeight = '300px';
    leaderboardTable.parentElement.style.overflowY = 'auto';
    leaderboardTable.parentElement.addEventListener('scroll', function () {
      const rows = leaderboardBody.querySelectorAll('tr');
      rows.forEach((row, idx) => {
        // Reveal rows as user scrolls down
        if (this.scrollTop > 0 && idx >= 6) {
          row.style.display = '';
        }
      });
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

  // List of common explicit/swear words (can be expanded)
  const bannedWords = [
    "2g1c","2 girls 1 cup","acrotomophilia","alabama hot pocket","alaskan pipeline","anal","anilingus","anus","apeshit","arsehole","ass","asshole","assmunch","auto erotic","autoerotic","babeland","baby batter","baby juice","ball gag","ball gravy","ball kicking","ball licking","ball sack","ball sucking","bangbros","bangbus","bareback","barely legal","barenaked","bastard","bastardo","bastinado","bbw","bdsm","beaner","beaners","beaver cleaver","beaver lips","beastiality","bestiality","big black","big breasts","big knockers","big tits","bimbos","birdlock","bitch","bitches","black cock","blonde action","blonde on blonde action","blowjob","blow job","blow your load","blue waffle","blumpkin","bollocks","bondage","boner","boob","boobs","booty call","brown showers","brunette action","bukkake","bulldyke","bullet vibe","bullshit","bung hole","bunghole","busty","butt","buttcheeks","butthole","camel toe","camgirl","camslut","camwhore","carpet muncher","carpetmuncher","chocolate rosebuds","cialis","circlejerk","cleveland steamer","clit","clitoris","clover clamps","clusterfuck","cock","cocks","coprolagnia","coprophilia","cornhole","coon","coons","creampie","cum","cumming","cumshot","cumshots","cunnilingus","cunt","darkie","date rape","daterape","deep throat","deepthroat","dendrophilia","dick","dildo","dingleberry","dingleberries","dirty pillows","dirty sanchez","doggie style","doggiestyle","doggy style","doggystyle","dog style","dolcett","domination","dominatrix","dommes","donkey punch","double dong","double penetration","dp action","dry hump","dvda","eat my ass","ecchi","ejaculation","erotic","erotism","escort","eunuch","fag","faggot","fecal","felch","fellatio","feltch","female squirting","femdom","figging","fingerbang","fingering","fisting","foot fetish","footjob","frotting","fuck","fuck buttons","fuckin","fucking","fucktards","fudge packer","fudgepacker","futanari","gangbang","gang bang","gay sex","genitals","giant cock","girl on","girl on top","girls gone wild","goatcx","goatse","god damn","gokkun","golden shower","goodpoop","goo girl","goregasm","grope","group sex","g-spot","guro","hand job","handjob","hard core","hardcore","hentai","homoerotic","honkey","hooker","horny","hot carl","hot chick","how to kill","how to murder","huge fat","humping","incest","intercourse","jack off","jail bait","jailbait","jelly donut","jerk off","jigaboo","jiggaboo","jiggerboo","jizz","juggs","kike","kinbaku","kinkster","kinky","knobbing","leather restraint","leather straight jacket","lemon party","livesex","lolita","lovemaking","make me come","male squirting","masturbate","masturbating","masturbation","menage a trois","milf","missionary position","mong","motherfucker","mound of venus","mr hands","muff diver","muffdiving","nambla","nawashi","negro","neonazi","nigga","nigger","nig nog","nimphomania","nipple","nipples","nsfw","nsfw images","nude","nudity","nutten","nympho","nymphomania","octopussy","omorashi","one cup two girls","one guy one jar","orgasm","orgy","paedophile","paki","panties","panty","pedobear","pedophile","pegging","penis","phone sex","piece of shit","pikey","pissing","piss pig","pisspig","playboy","pleasure chest","pole smoker","ponyplay","poof","poon","poontang","punany","poop chute","poopchute","porn","porno","pornography","prince albert piercing","pthc","pubes","pussy","queaf","queef","quim","raghead","raging boner","rape","raping","rapist","rectum","reverse cowgirl","rimjob","rimming","rosy palm","rosy palm and her 5 sisters","rusty trombone","sadism","santorum","scat","schlong","scissoring","semen","sex","sexcam","sexo","sexy","sexual","sexually","sexuality","shaved beaver","shaved pussy","shemale","shibari","shit","shitblimp","shitty","shota","shrimping","skeet","slanteye","slut","s&m","smut","snatch","snowballing","sodomize","sodomy","spastic","spic","splooge","splooge moose","spooge","spread legs","spunk","strap on","strapon","strappado","strip club","style doggy","suck","sucks","suicide girls","sultry women","swastika","swinger","tainted love","taste my","tea bagging","threesome","throating","thumbzilla","tied up","tight white","tit","tits","titties","titty","tongue in a","topless","tosser","towelhead","tranny","tribadism","tub girl","tubgirl","tushy","twat","twink","twinkie","two girls one cup","undressing","upskirt","urethra play","urophilia","vagina","venus mound","viagra","vibrator","violet wand","vorarephilia","voyeur","voyeurweb","voyuer","vulva","wank","wetback","wet dream","white power","whore","worldsex","wrapping men","wrinkled starfish","xx","xxx","yaoi","yellow showers","yiffy","zoophilia"
  ];

    const lowerName = name.toLowerCase();
  if (!name || !email) {
    alert('Please enter both name and email to login.');
    console.log('Signin failed: Missing name or email');
    return;
  }
  for (const word of bannedWords) {
    if (lowerName.includes(word)) {
      alert('Please enter a valid name without inappropriate words.');
      console.log('Signin failed: Inappropriate name');
      return;
    }
  }
  if (!isValidIITMEmail(email)) {
    alert('Please use a valid IIT Madras email');
    console.log('Signin failed: Invalid email');
    return;
  }

  // Only register if valid
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
