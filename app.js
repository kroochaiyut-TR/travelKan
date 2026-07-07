// DOM Elements
const screens = {
  setup: document.getElementById('setup-screen'),
  game: document.getElementById('game-screen')
};

const numPlayersInput = document.getElementById('num-players');
const playerNamesContainer = document.getElementById('player-names-container');
const gameTimeInput = document.getElementById('game-time');
const startBtn = document.getElementById('start-btn');

const boardEl = document.getElementById('board');
const playersListEl = document.getElementById('players-list');
const diceEl = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const actionTextEl = document.getElementById('action-text');
const turnIndicatorEl = document.getElementById('turn-indicator');
const timerDisplayEl = document.getElementById('timer-display');

const modalOverlay = document.getElementById('modal-overlay');
const questionModal = document.getElementById('question-modal');
const bonusModal = document.getElementById('bonus-modal');
const gameOverModal = document.getElementById('gameover-modal');

// Game State
let players = [];
let currentPlayerIndex = 0;
let gameTimeSeconds = 0;
let timerInterval = null;
let isAnimating = false;
let isPaused = false;

const playerColors = ['#ff4b1f', '#00c6ff', '#56ab2f', '#f7b733', '#8A2387', '#fc4a1a'];
const playerAvatars = ['🐶', '🐱', '🐼', '🦊', '🐸', '🦁'];

// Initialize Setup Screen
function initSetup() {
  updatePlayerNameInputs();
  numPlayersInput.addEventListener('change', updatePlayerNameInputs);
  startBtn.addEventListener('click', startGame);
}

function updatePlayerNameInputs() {
  const num = parseInt(numPlayersInput.value) || 2;
  let html = '';
  for (let i = 0; i < num; i++) {
    html += `
      <div class="form-group">
        <label>Player ${i + 1} Name:</label>
        <input type="text" id="p-name-${i}" value="Player ${i + 1}" maxlength="15">
      </div>
    `;
  }
  playerNamesContainer.innerHTML = html;
}

function startGame() {
  const num = parseInt(numPlayersInput.value);
  const minutes = parseInt(gameTimeInput.value) || 15;
  
  players = [];
  for (let i = 0; i < num; i++) {
    const name = document.getElementById(`p-name-${i}`).value || `Player ${i + 1}`;
    players.push({
      id: i,
      name: name,
      color: playerColors[i % playerColors.length],
      avatar: playerAvatars[i % playerAvatars.length],
      position: 0,
      score: 300,
      skipNextTurn: false
    });
  }
  
  gameTimeSeconds = minutes * 60;
  currentPlayerIndex = 0;
  
  screens.setup.classList.remove('active');
  screens.game.classList.add('active');
  
  renderBoard();
  renderPlayersSidebar();
  updateTurnUI();
  startTimer();
  updateTokensOnBoard();
}

// Board Rendering
function renderBoard() {
  boardEl.innerHTML = '';
  
  // Create 32 squares around a 9x9 grid
  boardConfig.forEach((sq, i) => {
    const div = document.createElement('div');
    div.className = 'square ' + getSquareClass(sq.type);
    div.id = `sq-${i}`;
    
    // Position calculation (9x9 grid, 0-8 top, 9-16 right, 17-24 bottom, 25-31 left)
    if (i <= 8) {
      div.style.left = `${(i / 9) * 100}%`;
      div.style.top = '0';
    } else if (i <= 16) {
      div.style.left = `${(8 / 9) * 100}%`;
      div.style.top = `${((i - 8) / 9) * 100}%`;
    } else if (i <= 24) {
      div.style.left = `${((24 - i) / 9) * 100}%`;
      div.style.top = `${(8 / 9) * 100}%`;
    } else {
      div.style.left = '0';
      div.style.top = `${((32 - i) / 9) * 100}%`;
    }
    
    // Inner HTML
    let label = sq.label || sq.type;
    let iconHtml = '';
    
    if (sq.type === 'QUESTION') label = 'Question';
    if (sq.type === 'BONUS_PIC') {
      label = 'Special Cards';
      iconHtml = '<div class="square-icon">🧚‍♀️</div>';
    }
    if (sq.type === 'RANDOM_BONUS') {
      label = 'Lucky Door';
      iconHtml = '<div class="square-icon">🚪</div>';
    }
    
    div.innerHTML = `<div class="square-number">${i}</div>${iconHtml}<div class="square-label">${label}</div><div class="tokens-container" id="tokens-${i}"></div>`;
    boardEl.appendChild(div);
  });
}

function getSquareClass(type) {
  switch(type) {
    case 'START': return 'sq-start';
    case 'QUESTION': return 'sq-question';
    case 'BONUS_PIC': return 'sq-bonus-pic';
    case 'RANDOM_BONUS': return 'sq-random';
    case 'LOSE_TURN': return 'sq-lose-turn';
    case 'SAFE': return 'sq-safe';
    default: return '';
  }
}

function updateTokensOnBoard() {
  // Clear all tokens
  for (let i = 0; i < 32; i++) {
    const container = document.getElementById(`tokens-${i}`);
    if (container) container.innerHTML = '';
  }
  
  // Place tokens
  players.forEach(p => {
    const container = document.getElementById(`tokens-${p.position}`);
    if (container) {
      const token = document.createElement('div');
      token.className = 'token';
      token.innerText = p.avatar;
      token.style.borderColor = p.color;
      container.appendChild(token);
    }
  });
}

// Sidebar Rendering
function renderPlayersSidebar() {
  let html = '';
  players.forEach((p, i) => {
    const activeClass = i === currentPlayerIndex ? 'active' : '';
    const statusText = p.skipNextTurn ? '(Skip Next Turn)' : '';
    html += `
      <div class="player-card ${activeClass}" id="p-card-${i}">
        <div class="player-avatar" style="border-color: ${p.color}">${p.avatar}</div>
        <div class="player-info">
          <div class="player-name">${p.name}</div>
          <div class="player-status">${statusText}</div>
        </div>
        <div class="player-score" id="p-score-${i}">${p.score} ฿</div>
      </div>
    `;
  });
  playersListEl.innerHTML = html;
}

function updateTurnUI() {
  if (isPaused) return;
  renderPlayersSidebar();
  const cp = players[currentPlayerIndex];
  turnIndicatorEl.style.color = cp.color;
  turnIndicatorEl.innerText = `${cp.name}'s Turn`;
  actionTextEl.innerText = `${cp.name}, roll the dice!`;
  rollBtn.disabled = false;
  
  if (cp.skipNextTurn) {
    actionTextEl.innerText = `${cp.name} is skipping a turn.`;
    cp.skipNextTurn = false;
    rollBtn.disabled = true;
    setTimeout(() => {
      nextTurn();
    }, 2000);
  }
}

function updateScoreUI(playerIndex) {
  const scoreEl = document.getElementById(`p-score-${playerIndex}`);
  if (scoreEl) {
    scoreEl.innerText = `${players[playerIndex].score} ฿`;
  }
}

// Timer Logic
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (!isPaused) {
      gameTimeSeconds--;
      updateTimerDisplay();
      if (gameTimeSeconds <= 0) {
        endGame();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(gameTimeSeconds / 60);
  const s = gameTimeSeconds % 60;
  timerDisplayEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
  if (gameTimeSeconds < 60) {
    timerDisplayEl.style.color = '#ff4b1f';
  }
}

function endGame() {
  clearInterval(timerInterval);
  rollBtn.disabled = true;
  
  // Sort players by score
  const sorted = [...players].sort((a, b) => b.score - a.score);
  
  let html = '';
  sorted.forEach((p, i) => {
    html += `
      <div class="final-score-item">
        <span>${i === 0 ? '🏆 ' : ''}${p.name}</span>
        <span>${p.score} ฿</span>
      </div>
    `;
  });
  
  document.getElementById('final-scores').innerHTML = html;
  
  showModal('gameover-modal');
}

document.getElementById('restart-btn').addEventListener('click', () => {
  hideModal('gameover-modal');
  screens.game.classList.remove('active');
  screens.setup.classList.add('active');
});

// Pause Logic
const pauseBtn = document.getElementById('pause-btn');
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  if (isPaused) {
    pauseBtn.innerText = 'Resume';
    pauseBtn.style.background = 'white';
    pauseBtn.style.color = 'var(--text-dark)';
    rollBtn.disabled = true;
    turnIndicatorEl.innerText = 'Game Paused';
    turnIndicatorEl.style.color = '#fff';
  } else {
    pauseBtn.innerText = 'Pause';
    pauseBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    pauseBtn.style.color = 'white';
    updateTurnUI(); // restores turn indicator and roll btn state
  }
});

// Quit Logic
document.getElementById('quit-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to quit the game? All progress will be lost.')) {
    clearInterval(timerInterval);
    isPaused = false;
    pauseBtn.innerText = 'Pause';
    pauseBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    pauseBtn.style.color = 'white';
    screens.game.classList.remove('active');
    screens.setup.classList.add('active');
  }
});

// Dice & Movement
rollBtn.addEventListener('click', () => {
  if (isAnimating || isPaused) return;
  isAnimating = true;
  rollBtn.disabled = true;
  
  const roll = Math.floor(Math.random() * 6) + 1;
  diceEl.classList.add('rolling');
  actionTextEl.innerText = `Rolling...`;
  
  setTimeout(() => {
    diceEl.classList.remove('rolling');
    diceEl.innerText = roll;
    actionTextEl.innerText = `Moved ${roll} spaces!`;
    movePlayer(roll);
  }, 1000);
});

function movePlayer(roll) {
  const cp = players[currentPlayerIndex];
  const oldPos = cp.position;
  let newPos = oldPos + roll;
  
  let passedStart = false;
  // Passed start?
  if (newPos >= 32) {
    newPos = newPos % 32;
    cp.score += 100;
    updateScoreUI(currentPlayerIndex);
    passedStart = true;
  }
  
  cp.position = newPos;
  updateTokensOnBoard();
  
  setTimeout(() => {
    if (passedStart && newPos !== 0) {
      showAnnouncement('Start!', '+100 ฿', 'correct');
      setTimeout(() => handleSquareAction(newPos), 2000);
    } else {
      handleSquareAction(newPos);
    }
  }, 1000);
}

// Actions
function handleSquareAction(pos) {
  const sq = boardConfig[pos];
  const cp = players[currentPlayerIndex];
  
  switch(sq.type) {
    case 'START':
      showAnnouncement('Start!', 'Landed on Start! +100 ฿', 'correct');
      setTimeout(nextTurn, 2000);
      break;
    case 'SAFE':
      actionTextEl.innerText = `Safe zone. Relax!`;
      setTimeout(nextTurn, 1500);
      break;
    case 'LOSE_TURN':
      actionTextEl.innerText = `Oh no! Lose next turn.`;
      cp.skipNextTurn = true;
      setTimeout(nextTurn, 1500);
      break;
    case 'QUESTION':
      showQuestionModal(sq.qIndex);
      break;
    case 'BONUS_PIC':
      showBonusPicModal();
      break;
    case 'RANDOM_BONUS':
      showRandomBonusModal();
      break;
  }
}

function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  isAnimating = false;
  updateTurnUI();
}

// Modals
function showModal(id) {
  modalOverlay.classList.add('active');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function hideModal(id) {
  modalOverlay.classList.remove('active');
  document.getElementById(id).classList.remove('active');
}

// Question Logic
function showQuestionModal(qIndex) {
  const qData = questions[qIndex];
  document.getElementById('q-title').innerText = `Question for ${qData.reward} ฿`;
  document.getElementById('q-text').innerText = qData.q;
  document.getElementById('q-image-container').style.display = 'none';
  
  let optionsHtml = '';
  qData.options.forEach((opt, idx) => {
    optionsHtml += `<button class="btn option-btn" onclick="answerQuestion(${qIndex}, ${idx}, false)">${opt}</button>`;
  });
  document.getElementById('q-options').innerHTML = optionsHtml;
  
  showModal('question-modal');
}

function showBonusPicModal() {
  // Pick random image and a generic question for bonus
  const rImageIndex = Math.floor(Math.random() * bonusImages.length);
  const imgData = bonusImages[rImageIndex];
  const reward = Math.floor(Math.random() * 51) + 50; // 50 to 100
  
  // For the bonus, we will ask them to identify the place
  const options = [];
  options.push(imgData.name);
  while(options.length < 2) {
    const wrong = bonusImages[Math.floor(Math.random() * bonusImages.length)].name;
    if (!options.includes(wrong)) options.push(wrong);
  }
  // Shuffle options
  if (Math.random() > 0.5) options.reverse();
  const correctAnswerIndex = options.indexOf(imgData.name);
  
  document.getElementById('q-title').innerText = `Special Card! Win ${reward} ฿`;
  document.getElementById('q-text').innerText = "What is the name of this location in Kanchanaburi?";
  
  const imgEl = document.getElementById('q-image');
  imgEl.src = `images/${imgData.file}`;
  document.getElementById('q-image-container').style.display = 'block';
  
  let optionsHtml = '';
  options.forEach((opt, idx) => {
    optionsHtml += `<button class="btn option-btn" onclick="answerBonus(${reward}, ${idx === correctAnswerIndex})">${opt}</button>`;
  });
  document.getElementById('q-options').innerHTML = optionsHtml;
  
  showModal('question-modal');
}

// Announcement Animation
function showAnnouncement(title, subtitle, type) {
  const annEl = document.getElementById('announcement');
  document.getElementById('announce-title').innerText = title;
  document.getElementById('announce-subtitle').innerText = subtitle;
  
  annEl.className = 'announcement'; // reset
  void annEl.offsetWidth; // trigger reflow
  annEl.classList.add(type === 'correct' ? 'show-correct' : 'show-wrong');
}

window.answerQuestion = function(qIndex, selectedIndex, isBonus) {
  const qData = questions[qIndex];
  const cp = players[currentPlayerIndex];
  const isCorrect = (qData.answer === selectedIndex);
  
  hideModal('question-modal');
  
  if (isCorrect) {
    cp.score += qData.reward;
    showAnnouncement('Correct!', `+${qData.reward} ฿`, 'correct');
  } else {
    showAnnouncement('Wrong!', `Answer: ${qData.options[qData.answer]}`, 'wrong');
  }
  
  updateScoreUI(currentPlayerIndex);
  setTimeout(nextTurn, 2000);
};

window.answerBonus = function(reward, isCorrect) {
  const cp = players[currentPlayerIndex];
  hideModal('question-modal');
  
  if (isCorrect) {
    cp.score += reward;
    showAnnouncement('Awesome!', `+${reward} ฿`, 'correct');
  } else {
    showAnnouncement('Missed!', 'Better luck next time!', 'wrong');
  }
  
  updateScoreUI(currentPlayerIndex);
  setTimeout(nextTurn, 2000);
};

// Random Bonus Logic
function showRandomBonusModal() {
  const r = Math.floor(Math.random() * randomBonuses.length);
  const bonus = randomBonuses[r];
  
  document.getElementById('bonus-text').innerText = bonus.text;
  
  const btn = document.getElementById('bonus-continue-btn');
  btn.onclick = () => {
    const cp = players[currentPlayerIndex];
    hideModal('bonus-modal');
    
    if (bonus.value === 'START') {
      cp.position = 0;
      updateTokensOnBoard();
      showAnnouncement('Oops!', 'Back to start!', 'wrong');
    } else {
      cp.score += bonus.value;
      if (bonus.value > 0) {
        showAnnouncement('Lucky!', `+${bonus.value} ฿`, 'correct');
      } else {
        showAnnouncement('Unlucky!', `${bonus.value} ฿`, 'wrong');
      }
    }
    
    updateScoreUI(currentPlayerIndex);
    setTimeout(nextTurn, 2000);
  };
  
  showModal('bonus-modal');
}

// Init
initSetup();
