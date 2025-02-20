import inquirer from "inquirer";
import rl from "readline-sync";
import chalk from "chalk";

// Player related variables
const playerTokens = ["O", "X"];
let activePlayer = true;
let activePlayerToken = " ";

// Game related variables
let gameOver = false;
const board = [
  [" ", " ", " "],
  [" ", " ", " "],
  [" ", " ", " "],
];
const pointer = [1, 1];
const winConditions = ["OOO", "XXX"];
let drawCondition = false;

// Game functions
const toggleActivePlayer = () => {
  activePlayer = !activePlayer;
  return playerTokens[+!activePlayer]; //return token of active player before toggle, +! converts previous boolean value to number
};
const renderBoard = () => {
  console.clear(); //clear board before re-rendering
  const chalkBoard = board.map((rowVal, row) =>
    rowVal.map((colVal, col) =>
      row == pointer[0] && col == pointer[1]
        ? chalk.red(activePlayerToken)
        : colVal
    )
  ); //map pointer onto board using chalk

  const boardRow = (nr, arr) => `${nr} | ${arr.join(" | ")} |`;
  const boardLine = `  +-----------+`;
  let row = 0;
  console.log(
    [
      `    0   1   2`,
      boardLine,
      boardRow(row, chalkBoard[row++]),
      boardLine,
      boardRow(row, chalkBoard[row++]),
      boardLine,
      boardRow(row, chalkBoard[row++]),
      boardLine,
    ].join("\n")
  );
};

do {
  activePlayerToken = toggleActivePlayer(); //toggle active player and return token (X or O)

  renderBoard(); //render board before player input

  let key;
  let continueCheck = true;

  while (continueCheck) {
    key = rl.keyIn(
      "Use zqsd/wasd to select a position, press space to enter: "
    );
    switch (key) {
      case "w":
      case "z":
        pointer[0] = Math.max(0, --pointer[0]);
        break;
      case "a":
      case "q":
        pointer[1] = Math.max(0, --pointer[1]);
        break;
      case "s":
        pointer[0] = Math.min(++pointer[0], 2);
        break;
      case "d":
        pointer[1] = Math.min(++pointer[1], 2);
        break;
      case " ": // check if place in board is filled in already, if not: continue and process input
        if (board[pointer[0]][pointer[1]] == " ") continueCheck = false;
        break;
    }

    renderBoard(); // re-render board after every key press
  }

  let [x, y] = pointer;
  board[x][y] = activePlayerToken;

  const checkRows = (b) =>
    b.some((row) => winConditions.includes(row.join("")));
  const transpose = (b) =>
    b[0].map((_, colIndex) => b.map((row) => row[colIndex])).reverse();

  const checkDiagonal = (b) =>
    winConditions.includes([b[0][0], b[1][1], b[2][2]].join(""));

  if (
    checkRows(board) ||
    checkRows(transpose(board)) ||
    checkDiagonal(board) ||
    checkDiagonal(transpose(board))
  )
    gameOver = true;
  else if (!board.flat().some((e) => e == " ")) {
    // only check if board is full when no victory condition was met
    gameOver = true;
    drawCondition = true;
  }
} while (!gameOver);

// final render and victory message
renderBoard();
console.log(!drawCondition ? `${activePlayerToken} won!!!` : "Draw");
