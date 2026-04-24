import { Chess } from 'https://cdn.jsdelivr.net/npm/chess.js@1.1.0/+esm';

const bootSequence = document.getElementById('boot-sequence');
const desktop = document.getElementById('desktop');
const appButtons = document.querySelectorAll('.app-icon');
const modal = document.getElementById('app-modal');
const modalTitle = document.getElementById('modal-title');
const closeModalButton = document.getElementById('close-modal');
const clock = document.getElementById('clock');
const comingSoonPanel = document.getElementById('coming-soon-panel');
const gameMenuPanel = document.getElementById('game-menu-panel');
const tabButtons = document.querySelectorAll('.tab-btn');
const gameTabs = document.querySelectorAll('.game-tab');

const bootDurationMs = 4400;

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

setTimeout(() => {
  bootSequence.classList.add('hidden');
  desktop.classList.remove('hidden');
}, bootDurationMs);

function showTab(tabId) {
  gameTabs.forEach((tab) => tab.classList.toggle('hidden', tab.id !== tabId));
  tabButtons.forEach((button) =>
    button.classList.toggle('active', button.dataset.gameTab === tabId.replace('-tab', '')),
  );
}

tabButtons.forEach((button) =>
  button.addEventListener('click', () => showTab(`${button.dataset.gameTab}-tab`)),
);

appButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const appName = button.dataset.app ?? 'This app';
    modalTitle.textContent = appName;

    const isGameMenu = appName === 'Game Menu';
    comingSoonPanel.classList.toggle('hidden', isGameMenu);
    gameMenuPanel.classList.toggle('hidden', !isGameMenu);
    if (isGameMenu) {
      showTab('tic-tab');
    }

    modal.showModal();
  });
});

closeModalButton.addEventListener('click', () => modal.close());

modal.addEventListener('click', (event) => {
  const rect = modal.getBoundingClientRect();
  const insideDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!insideDialog) {
    modal.close();
  }
});

// Tic-Tac-Toe
const ticBoardEl = document.getElementById('tic-board');
const ticStatusEl = document.getElementById('tic-status');
const ticCommentaryEl = document.getElementById('tic-commentary');
const ticResetBtn = document.getElementById('tic-reset');
const ticIntelligence = document.getElementById('tic-intelligence');
const ticLevel = document.getElementById('tic-level');

let ticBoard = Array(9).fill('');
let ticGameOver = false;
let playerMistakes = 0;

function getAvailableMoves(board) {
  return board.map((v, i) => (v === '' ? i : null)).filter((v) => v !== null);
}

function getWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function minimaxTTT(board, isMaximizing) {
  const winner = getWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (winner === 'draw') return 0;

  const moves = getAvailableMoves(board);
  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      board[move] = 'O';
      best = Math.max(best, minimaxTTT(board, false));
      board[move] = '';
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    board[move] = 'X';
    best = Math.min(best, minimaxTTT(board, true));
    board[move] = '';
  }
  return best;
}

function bestTicMove(board, intelligence = 4) {
  const available = getAvailableMoves(board);
  const isRandom = Math.random() > intelligence / 5;
  if (isRandom) return available[Math.floor(Math.random() * available.length)];

  let bestScore = -Infinity;
  let move = available[0];
  for (const i of available) {
    board[i] = 'O';
    const score = minimaxTTT(board, false);
    board[i] = '';
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function sarcasticTicComment(result = 'move') {
  const jabs = [
    'Impressive. You found the one move my toaster predicted.',
    'You play like chaos is a strategy. Bold.',
    'I have seen stronger tactics in coin flips.',
    'Brilliant. In an alternate universe.',
    'That move was... legally a move.',
  ];
  const nervous = [
    'Uh, okay, that was annoyingly sharp. Lucky, probably.',
    'Wait, are you setting a trap? I hate that.',
  ];

  if (result === 'mistake') return jabs[Math.floor(Math.random() * jabs.length)];
  if (result === 'good') return nervous[Math.floor(Math.random() * nervous.length)];
  return 'Your style is a cocktail of aggression and mild panic.';
}

function renderTicBoard() {
  ticBoardEl.innerHTML = '';
  ticBoard.forEach((value, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tic-cell';
    btn.textContent = value;
    btn.disabled = value !== '' || ticGameOver;
    btn.addEventListener('click', () => playerTicMove(index));
    ticBoardEl.append(btn);
  });
}

function settleTicState() {
  const winner = getWinner(ticBoard);
  if (!winner) return false;
  ticGameOver = true;
  if (winner === 'draw') {
    ticStatusEl.textContent = 'Draw! Nobody wins, everybody wastes time.';
    ticCommentaryEl.textContent = sarcasticTicComment();
  } else if (winner === 'X') {
    ticStatusEl.textContent = 'You win! Annoying, but fair.';
    ticCommentaryEl.textContent = sarcasticTicComment('good');
  } else {
    ticStatusEl.textContent = 'CPU wins. Predictable outcome.';
    ticCommentaryEl.textContent = sarcasticTicComment('mistake');
  }
  return true;
}

function playerTicMove(index) {
  if (ticBoard[index] || ticGameOver) return;

  const available = getAvailableMoves(ticBoard);
  const best = bestTicMove([...ticBoard], 5);
  if (available.length > 3 && index !== best) {
    playerMistakes += 1;
    ticCommentaryEl.textContent = sarcasticTicComment('mistake');
  }

  ticBoard[index] = 'X';
  renderTicBoard();
  if (settleTicState()) return;

  ticStatusEl.textContent = 'CPU is thinking...';
  setTimeout(() => {
    const cpuMove = bestTicMove([...ticBoard], Number(ticIntelligence.value));
    if (cpuMove !== undefined) ticBoard[cpuMove] = 'O';
    renderTicBoard();
    settleTicState();
    if (!ticGameOver) {
      ticStatusEl.textContent = `Your move. Mistakes noted: ${playerMistakes}`;
      if (playerMistakes === 0) ticCommentaryEl.textContent = sarcasticTicComment('good');
    }
  }, 380);
}

function resetTicGame() {
  ticBoard = Array(9).fill('');
  ticGameOver = false;
  playerMistakes = 0;
  ticStatusEl.textContent = 'You are X. Try not to embarrass yourself.';
  ticCommentaryEl.textContent = 'I am calibrated to 4/5 sarcasm and 5/5 judgment.';
  ticLevel.textContent = `${ticIntelligence.value}/5`;
  renderTicBoard();
}

ticResetBtn.addEventListener('click', resetTicGame);
ticIntelligence.addEventListener('input', () => {
  ticLevel.textContent = `${ticIntelligence.value}/5`;
  ticCommentaryEl.textContent = `CPU ego adjusted to ${ticIntelligence.value}/5.`;
});
resetTicGame();

// Chess
const pieceGlyph = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
};
const pieceValue = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const chess = new Chess();
const chessBoardEl = document.getElementById('chess-board');
const chessStatusEl = document.getElementById('chess-status');
const chessCommentaryEl = document.getElementById('chess-commentary');
const chessResetBtn = document.getElementById('chess-reset');
const chessDifficultyEl = document.getElementById('chess-difficulty');

let selectedSquare = null;
let validTargets = [];
let chessLocked = false;

function evaluateBoard(game) {
  let score = 0;
  const board = game.board();
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = pieceValue[piece.type] || 0;
      score += piece.color === 'b' ? value : -value;
    }
  }
  return score;
}

function minimaxChess(game, depth, alpha, beta, maximizing) {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const val = minimaxChess(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    game.move(move);
    const val = minimaxChess(game, depth - 1, alpha, beta, true);
    game.undo();
    minEval = Math.min(minEval, val);
    beta = Math.min(beta, val);
    if (beta <= alpha) break;
  }
  return minEval;
}

function pickChessMove() {
  const difficulty = chessDifficultyEl.value;
  const depth = { easy: 1, normal: 2, hard: 3 }[difficulty];
  const moves = chess.moves({ verbose: true });
  let bestMove = moves[0];
  let bestEval = -Infinity;

  for (const move of moves) {
    chess.move(move);
    let evalScore = minimaxChess(chess, depth - 1, -Infinity, Infinity, false);
    chess.undo();

    if (difficulty === 'easy') evalScore += (Math.random() - 0.5) * 220;
    if (difficulty === 'normal') evalScore += (Math.random() - 0.5) * 80;

    if (evalScore > bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }
  return bestMove;
}

function chessBotTalk() {
  const score = evaluateBoard(chess);
  if (score < -250) return 'You blundered that piece so hard I almost feel bad. Almost.';
  if (score > 260)
    return 'Uh... I am not panicking, you are panicking. This is a totally controlled collapse.';
  const lines = [
    'Cute move. I have seen scarier opening prep in a fortune cookie.',
    'I respect the confidence, not the accuracy.',
    'That tactic was spicy. Reckless, but spicy.',
    'Your mouse is brave. Your position, less so.',
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function updateChessStatus() {
  if (chess.isCheckmate()) {
    chessStatusEl.textContent = chess.turn() === 'w' ? 'Checkmate. Bot wins.' : 'Checkmate. You win!';
    chessCommentaryEl.textContent =
      chess.turn() === 'w' ?
        'Good game. I bullied your king.'
      : 'No no no, this is statistically impossible.';
    return;
  }

  if (chess.isDraw()) {
    chessStatusEl.textContent = 'Drawn game.';
    chessCommentaryEl.textContent = 'Mutual mediocrity achieved.';
    return;
  }

  chessStatusEl.textContent = chess.turn() === 'w' ? 'Your turn (White).' : 'Bot thinking (Black)...';
  chessCommentaryEl.textContent = chessBotTalk();
}

function renderChessBoard() {
  chessBoardEl.innerHTML = '';
  const board = chess.board();

  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const square = String.fromCharCode(97 + c) + (8 - r);
      const piece = board[r][c];
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `chess-cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
      if (square === selectedSquare) cell.classList.add('selected');
      if (validTargets.includes(square)) cell.classList.add('move-hint');
      cell.textContent = piece ? pieceGlyph[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] : '';
      cell.addEventListener('click', () => onChessSquareClick(square));
      chessBoardEl.append(cell);
    }
  }
}

function onChessSquareClick(square) {
  if (chessLocked || chess.turn() !== 'w' || chess.isGameOver()) return;

  const piece = chess.get(square);
  if (selectedSquare && validTargets.includes(square)) {
    chess.move({ from: selectedSquare, to: square, promotion: 'q' });
    selectedSquare = null;
    validTargets = [];
    renderChessBoard();
    updateChessStatus();

    if (!chess.isGameOver()) {
      chessLocked = true;
      setTimeout(() => {
        const aiMove = pickChessMove();
        if (aiMove) chess.move(aiMove);
        chessLocked = false;
        renderChessBoard();
        updateChessStatus();
      }, 320);
    }
    return;
  }

  if (!piece || piece.color !== 'w') {
    selectedSquare = null;
    validTargets = [];
  } else {
    selectedSquare = square;
    validTargets = chess.moves({ square, verbose: true }).map((m) => m.to);
  }

  renderChessBoard();
}

function resetChessGame() {
  chess.reset();
  chessLocked = false;
  selectedSquare = null;
  validTargets = [];
  renderChessBoard();
  updateChessStatus();
}

chessResetBtn.addEventListener('click', resetChessGame);
chessDifficultyEl.addEventListener('change', () => {
  chessCommentaryEl.textContent = `Difficulty switched to ${chessDifficultyEl.value}. Good luck, you'll need it.`;
});

resetChessGame();
