// Крестики-нолики: игрок — X, компьютер — O.
// В массиве 9 элементов: пустая строка означает свободную клетку.
const board = Array(9).fill("");
const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#status-text");
const statusBox = document.querySelector("#status");
const restartButton = document.querySelector("#restart");

// Все 8 способов собрать три одинаковых знака в ряд.
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
  [0, 4, 8], [2, 4, 6]             // диагонали
];

let gameOver = false;
let botThinking = false;
let botTimer = null;
const score = { X: 0, O: 0, draw: 0 };

// Рисуем знак в выбранной клетке и сохраняем его в массиве.
function makeMove(index, mark) {
  board[index] = mark;
  cells[index].textContent = mark === "X" ? "×" : "○";
  cells[index].classList.add(mark.toLowerCase());
  cells[index].setAttribute("aria-label", `Клетка ${index + 1}: ${mark}`);
  cells[index].disabled = true;
}

// Возвращает победную линию или undefined, если победы нет.
function findWin(mark) {
  return winningLines.find(([a, b, c]) =>
    board[a] === mark && board[b] === mark && board[c] === mark
  );
}

function updateScore() {
  document.querySelector("#player-score").textContent = score.X;
  document.querySelector("#bot-score").textContent = score.O;
  document.querySelector("#draw-score").textContent = score.draw;
}

// После каждого хода смотрим: победа, ничья или продолжение.
function checkGame(mark) {
  const line = findWin(mark);
  if (line) {
    gameOver = true;
    botThinking = false;
    score[mark]++;
    line.forEach(index => cells[index].classList.add("win"));
    statusText.textContent = mark === "X" ? "🎉 Ты победил!" : "🤖 Бот победил!";
  } else if (board.every(cell => cell !== "")) {
    gameOver = true;
    botThinking = false;
    score.draw++;
    statusText.textContent = "🤝 Ничья! Попробуй снова.";
  } else {
    return false;
  }

  statusBox.classList.add("finished");
  // После окончания игры в свободные клетки тоже ходить нельзя.
  cells.forEach(cell => cell.disabled = true);
  updateScore();
  return true;
}

// Бот выбирает СЛУЧАЙНУЮ свободную клетку, как требует задание.
function botMove() {
  botTimer = null;
  if (gameOver) return;

  const freeCells = board
    .map((mark, index) => mark === "" ? index : null)
    .filter(index => index !== null);

  const randomIndex = Math.floor(Math.random() * freeCells.length);
  makeMove(freeCells[randomIndex], "O");

  if (!checkGame("O")) {
    botThinking = false;
    statusText.textContent = "Твой ход — выбирай клетку!";
  }
}

// Срабатывает, когда игрок нажимает на клетку.
function playerMove(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (gameOver || botThinking || board[index] !== "") return;

  makeMove(index, "X");
  if (checkGame("X")) return;

  botThinking = true;
  statusText.textContent = "🤖 Бот думает...";
  botTimer = setTimeout(botMove, 450);
}

// Начать новый раунд (счёт побед сохраняется).
function newGame() {
  clearTimeout(botTimer); // отменяем ход бота, если нажали во время ожидания
  botTimer = null;
  board.fill("");
  gameOver = false;
  botThinking = false;
  statusBox.classList.remove("finished");
  statusText.textContent = "Твой ход — выбирай клетку!";

  cells.forEach((cell, index) => {
    cell.textContent = "";
    cell.className = "cell";
    cell.disabled = false;
    cell.setAttribute("aria-label", `Клетка ${index + 1}: пусто`);
  });
}

cells.forEach(cell => cell.addEventListener("click", playerMove));
restartButton.addEventListener("click", newGame);