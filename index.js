import inquirer from "inquirer";
const board = [
  [" ", " ", " "],
  [" ", " ", " "],
  [" ", " ", " "],
];

const players = ["O", "X"];
let currentActivePlayer = true;
const activePlayer = () => {
  currentActivePlayer = !currentActivePlayer;
  return players[+!currentActivePlayer];
};
const renderBoard = () => {
  const row = (nr, arr) => `${nr} | ${arr.join(" | ")} |`;
  const line = `  +-----------+`;
  console.log(
    [
      `    0   1   2`,
      line,
      row(0, board[0]),
      line,
      row(1, board[1]),
      line,
      row(2, board[2]),
      line,
    ].join("\n")
  );
};

let gameRunning = true;
const regex = new RegExp(/ *([012]) *, *([012]) */);
let temp;

do {
  renderBoard();

  temp = activePlayer();
  let getCoords = (input) => input.coords.split(",").map((c) => +c.trim());

  const input = await inquirer.prompt([
    {
      type: "input",
      name: "coords",
      message: `Player ${temp}, enter coordinates (x,y): `,
      validate: (input) => {
        let [match, x, y] = input.match(regex) ?? [];
        return match && board[x][y] == " " ? true : "Please enter valid coords";
      },
    },
  ]);

  let [x, y] = getCoords(input);
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
