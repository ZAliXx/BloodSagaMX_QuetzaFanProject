const HOME_URL = "../Welcome.html";

const WORD_POOL = [
  "SANGRE", "VAMPIRO", "COLMILLO", "OSCURIDAD", "MEDIANOCHE","SOMBRA", "ETERNO", "CASTILLO", "NOCTURNO", "LUNA",
  "SAGA", "GIRA", "ATARDECER", "MISTERIO", "LEYENDA","FORESHADOW", "FATE", "KNIFE","XO", "DAYDREAM","OUTSIDE",
  "MOONSTRUCK","HELIUM", "LOOSE", "ROYALTY", "SACRIFICE", "TEETH", "CHACONNE","LUCIFER", "BILLS", "BLOSSOM", "SCREAM"
];

const DIFFICULTY = {
  easy:   { size: 10, wordCount: 6,  directions: "straight" },
  medium: { size: 14, wordCount: 9,  directions: "all" },
  hard:   { size: 18, wordCount: 12, directions: "all" }
};

const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

const ALL_DIRECTIONS = [
  [0,1], [1,0], [1,1], [-1,1], [0,-1], [-1,0], [-1,-1], [1,-1]
];
const STRAIGHT_DIRECTIONS = [
  [0,1], [1,0], [0,-1], [-1,0]
];

let SIZE = 14;
let grid = [];
let placedWords = [];
let foundWords = new Set();
let isSelecting = false;
let selectionPath = [];
let currentDirections = ALL_DIRECTIONS;
let isPaused = false;
let hasTimer = false;
let elapsedSeconds = 0;
let timerInterval = null;

const gridEl = document.getElementById('grid');
const wordlistEl = document.getElementById('wordlist');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const pauseBtn = document.getElementById('pause');
const difficultySelect = document.getElementById('difficulty');
const timerEl = document.getElementById('timer');

const overlayEl = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const overlayResume = document.getElementById('overlay-resume');
const overlayReplay = document.getElementById('overlay-replay');
const overlayHome = document.getElementById('overlay-home');

function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyGrid(){
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function tryPlaceWord(word){
  const attempts = 250;
  for(let a = 0; a < attempts; a++){
    const dir = currentDirections[Math.floor(Math.random() * currentDirections.length)];
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    const endRow = row + dir[0] * (word.length - 1);
    const endCol = col + dir[1] * (word.length - 1);
    if(endRow < 0 || endRow >= SIZE || endCol < 0 || endCol >= SIZE) continue;

    let ok = true;
    const cells = [];
    for(let i = 0; i < word.length; i++){
      const r = row + dir[0] * i;
      const c = col + dir[1] * i;
      const existing = grid[r][c];
      if(existing !== null && existing !== word[i]){
        ok = false;
        break;
      }
      cells.push([r, c]);
    }
    if(!ok) continue;

    cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
    return cells;
  }
  return null;
}

function buildPuzzle(){
  const preset = DIFFICULTY[difficultySelect.value];
  SIZE = preset.size;
  currentDirections = preset.directions === "all" ? ALL_DIRECTIONS : STRAIGHT_DIRECTIONS;

  grid = emptyGrid();
  placedWords = [];
  foundWords = new Set();

  const chosen = shuffle(WORD_POOL).slice(0, preset.wordCount);
  const sorted = [...chosen].sort((a, b) => b.length - a.length);

  sorted.forEach(w => {
    const word = w.toUpperCase();
    const cells = tryPlaceWord(word);
    if(cells){
      placedWords.push({ word, cells });
    }
  });

  for(let r = 0; r < SIZE; r++){
    for(let c = 0; c < SIZE; c++){
      if(grid[r][c] === null){
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }
}

function renderGrid(){
  applyCellSize();
  gridEl.style.gridTemplateColumns = `repeat(${SIZE}, var(--cell-size))`;
  gridEl.innerHTML = '';
  for(let r = 0; r < SIZE; r++){
    for(let c = 0; c < SIZE; c++){
      const div = document.createElement('div');
      div.className = 'cell';
      div.textContent = grid[r][c];
      div.dataset.r = r;
      div.dataset.c = c;
      gridEl.appendChild(div);
    }
  }
}

function applyCellSize(){
  const GAP = 3;
  const panel = gridEl.closest('.grid-panel');
  let availableWidth;

  if(panel){
    const panelStyles = getComputedStyle(panel);
    const panelPadding = parseFloat(panelStyles.paddingLeft) + parseFloat(panelStyles.paddingRight);
    availableWidth = panel.clientWidth - panelPadding;
  } else {
    availableWidth = Math.min(window.innerWidth - 32, 620);
  }

  const rawSize = (availableWidth - GAP * (SIZE - 1)) / SIZE;
  const cellSize = Math.max(14, Math.min(34, Math.floor(rawSize)));
  gridEl.style.setProperty('--cell-size', `${cellSize}px`);
}

window.addEventListener('resize', () => {
  if(SIZE) applyCellSize();
});

function renderWordlist(){
  wordlistEl.innerHTML = '';
  placedWords.forEach(({ word }) => {
    const li = document.createElement('li');
    li.textContent = word;
    li.dataset.word = word;
    if(foundWords.has(word)) li.classList.add('done');
    wordlistEl.appendChild(li);
  });
  statusEl.textContent = `Encontradas: ${foundWords.size} / ${placedWords.length}`;

  if(placedWords.length > 0 && foundWords.size === placedWords.length){
    handleWin();
  }
}

// ---------- TEMPORIZADOR ----------
function formatTime(totalSeconds){
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay(){
  timerEl.textContent = formatTime(elapsedSeconds);
}

function startTimer(){
  stopTimerInterval();
  if(!hasTimer) return;
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimerInterval(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer(){
  stopTimerInterval();
  elapsedSeconds = 0;
  const preset = DIFFICULTY[difficultySelect.value];
  hasTimer = preset.directions === "all"; // activo en media y difícil
  timerEl.classList.toggle('hidden-timer', !hasTimer);
  updateTimerDisplay();
  if(hasTimer) startTimer();
}

// ---------- PAUSA / VICTORIA (overlay) ----------
function setGridDisabled(disabled){
  gridEl.classList.toggle('grid-disabled', disabled);
}

function openOverlay({ title, message, showResume }){
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  overlayResume.style.display = showResume ? 'block' : 'none';
  overlayEl.classList.remove('hidden');
}

function closeOverlay(){
  overlayEl.classList.add('hidden');
}

function pauseGame(){
  if(isPaused) return;
  isPaused = true;
  stopTimerInterval();
  setGridDisabled(true);
  openOverlay({
    title: '⏸ Pausa',
    message: hasTimer ? `Tiempo detenido en ${formatTime(elapsedSeconds)}` : 'El juego está en pausa',
    showResume: true
  });
}

function resumeGame(){
  isPaused = false;
  setGridDisabled(false);
  closeOverlay();
  if(hasTimer) startTimer();
}

function handleWin(){
  stopTimerInterval();
  setGridDisabled(true);
  openOverlay({
    title: '🩸 ¡Victoria!',
    message: hasTimer ? `Completaste la sopa de letras en ${formatTime(elapsedSeconds)}` : '¡Completaste la sopa de letras!',
    showResume: false
  });
}

function getCellEl(r, c){
  return gridEl.children[r * SIZE + c];
}

function clearSelectionStyles(){
  selectionPath.forEach(([r, c]) => {
    const el = getCellEl(r, c);
    if(!el.classList.contains('found')) el.classList.remove('selecting');
  });
}

function isValidLine(path){
  if(path.length < 2) return true;
  const [r0, c0] = path[0];
  const [r1, c1] = path[1];
  const dr = Math.sign(r1 - r0);
  const dc = Math.sign(c1 - c0);
  for(let i = 1; i < path.length; i++){
    const [pr, pc] = path[i - 1];
    const [cr, cc] = path[i];
    if(cr - pr !== dr || cc - pc !== dc) return false;
  }
  return true;
}

function pathToWord(path){
  return path.map(([r, c]) => grid[r][c]).join('');
}

function checkMatch(path){
  const word = pathToWord(path);
  const reversed = word.split('').reverse().join('');
  return placedWords.find(pw =>
    !foundWords.has(pw.word) &&
    (pw.word === word || pw.word === reversed) &&
    pw.cells.length === path.length
  );
}

function markFound(pw){
  foundWords.add(pw.word);
  pw.cells.forEach(([r, c]) => {
    getCellEl(r, c).classList.add('found');
    getCellEl(r, c).classList.remove('selecting');
  });
  renderWordlist();
}

function startSelection(r, c){
  isSelecting = true;
  selectionPath = [[r, c]];
  getCellEl(r, c).classList.add('selecting');
}

function extendSelection(r, c){
  if(!isSelecting) return;
  const last = selectionPath[selectionPath.length - 1];
  if(last[0] === r && last[1] === c) return;

  const [sr, sc] = selectionPath[0];
  const drRaw = r - sr, dcRaw = c - sc;
  const steps = Math.max(Math.abs(drRaw), Math.abs(dcRaw));
  if(steps === 0) return;
  if(drRaw !== 0 && dcRaw !== 0 && Math.abs(drRaw) !== Math.abs(dcRaw)) return;

  const dr = Math.sign(drRaw), dc = Math.sign(dcRaw);
  const newPath = [];
  for(let i = 0; i <= steps; i++){
    newPath.push([sr + dr * i, sc + dc * i]);
  }

  clearSelectionStyles();
  selectionPath = newPath;
  selectionPath.forEach(([pr, pc]) => {
    const el = getCellEl(pr, pc);
    if(!el.classList.contains('found')) el.classList.add('selecting');
  });
}

function endSelection(){
  if(!isSelecting) return;
  isSelecting = false;
  if(selectionPath.length >= 2 && isValidLine(selectionPath)){
    const match = checkMatch(selectionPath);
    if(match){
      markFound(match);
      selectionPath = [];
      return;
    }
  }
  clearSelectionStyles();
  selectionPath = [];
}

function attachEvents(){
  gridEl.addEventListener('mousedown', e => {
    const cell = e.target.closest('.cell');
    if(!cell) return;
    startSelection(+cell.dataset.r, +cell.dataset.c);
  });
  gridEl.addEventListener('mouseover', e => {
    const cell = e.target.closest('.cell');
    if(!cell) return;
    extendSelection(+cell.dataset.r, +cell.dataset.c);
  });
  document.addEventListener('mouseup', endSelection);

  gridEl.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el && el.closest('.cell');
    if(!cell) return;
    startSelection(+cell.dataset.r, +cell.dataset.c);
  }, { passive: true });
  gridEl.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el && el.closest('.cell');
    if(!cell) return;
    extendSelection(+cell.dataset.r, +cell.dataset.c);
  }, { passive: true });
  document.addEventListener('touchend', endSelection);

  resetBtn.addEventListener('click', newGame);
  difficultySelect.addEventListener('change', newGame);

  pauseBtn.addEventListener('click', () => {
    if(isPaused) return;
    pauseGame();
  });

  overlayResume.addEventListener('click', resumeGame);
  overlayReplay.addEventListener('click', () => {
    closeOverlay();
    isPaused = false;
    newGame();
  });
  overlayHome.addEventListener('click', () => {
    window.location.href = HOME_URL;
  });
}

function newGame(){
  isPaused = false;
  closeOverlay();
  setGridDisabled(false);
  buildPuzzle();
  renderGrid();
  renderWordlist();
  resetTimer();
}

attachEvents();
newGame();