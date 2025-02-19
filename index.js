import inquirer from "inquirer";
import rl from "readline-sync";
import chalk from "chalk";
const board = [
  [" ", " ", " "],
  [" ", " ", " "],
  [" ", " ", " "],
];

const players = ["O", "X"];
let currentActivePlayer = true;

let gameRunning = true;
const regex = new RegExp(/ *([012]) *, *([012]) */);
let temp = " ";

const pointer = [1, 1];
const activePlayer = () => {
  currentActivePlayer = !currentActivePlayer;
  return players[+!currentActivePlayer];
};
const renderBoard = () => {
  console.clear();
  const chalkBoard = board.map((rowVal, row) =>
    rowVal.map((colVal, col) =>
      row == pointer[0] && col == pointer[1] ? chalk.red(temp) : colVal
    )
  );

  const row = (nr, arr) => `${nr} | ${arr.join(" | ")} |`;
  const line = `  +-----------+`;
  console.log(
    [
      `    0   1   2`,
      line,
      row(0, chalkBoard[0]),
      line,
      row(1, chalkBoard[1]),
      line,
      row(2, chalkBoard[2]),
      line,
    ].join("\n")
  );
};

do {
  temp = activePlayer();
  let getCoords = (input) => input.coords.split(",").map((c) => +c.trim());

  renderBoard();
  //   const input = await inquirer.prompt([
  //     {
  //       type: "input",
  //       name: "coords",
  //       message: `Player ${temp}, enter coordinates (x,y): `,
  //       validate: (input) => {
  //         let [match, x, y] = input.match(regex) ?? [];
  //         return match && board[x][y] == " " ? true : "Please enter valid coords";
  //       },
  //     },
  //   ]);

  const confirm = " ";
  let key;
  while (key !== confirm) {
    key = rl.keyIn("Use zqsd to select a position, press space to enter: ");
    switch (key) {
      case "z":
        pointer[0] = Math.max(0, --pointer[0]);
        break;
      case "q":
        pointer[1] = Math.max(0, --pointer[1]);
        break;
      case "s":
        pointer[0] = Math.min(++pointer[0], 2);
        break;
      case "d":
        pointer[1] = Math.min(++pointer[1], 2);
        break;
    }

    renderBoard();
  }

  let [x, y] = pointer;
  console.log(x, y);

  board[x][y] = temp;

  if (!board.flat().some((e) => e == " ")) gameRunning = false;

  const checkRow = (b) =>
    b.some((row) => ["OOO", "XXX"].includes(row.join("")));
  const transpose = (b) =>
    b[0].map((_, colIndex) => b.map((row) => row[colIndex])).reverse();

  const checkDiagonal = (b) =>
    ["OOO", "XXX"].includes([b[0][0], b[1][1], b[2][2]].join(""));

  if (
    checkRow(board) ||
    checkRow(transpose(board)) ||
    checkDiagonal(board) ||
    checkDiagonal(transpose(board))
  )
    gameRunning = false;
} while (gameRunning);

renderBoard();
console.log(`${temp} won!!!`);
