import osc from "osc";
import rl from "readline-sync";
import chalk from "chalk";

const remoteAddress = "10.28.200.135";

// connection
var udp = new osc.UDPPort({
  localAddress: "0.0.0.0", // shouldn't matter here :
  localPort: 9000, // not receiving, but here's a port anyway
  remoteAddress: remoteAddress, // the other laptop
  remotePort: 9000, // the port to send to
});

udp.on("ready", function () {
  udp.send({
    address: "/connect",
    args: JSON.stringify({}),
  });
});

udp.on("message", function (message, timetag, info) {
  let data;
  switch (message.address) {
    case "/connect":
      udp.send({ address: "/gamestart" });
      break;
    case "/gamestart":
      takeTurn();
      break;
    case "/turn":
      data = JSON.parse(message.args);
      board = data.board;
      activePlayer = data.activePlayer;
      takeTurn();
      break;
    case "/gameover":
      data = JSON.parse(message.args);
      board = data.board;
      activePlayer = data.activePlayer;
      renderBoard();
      console.log(data.win);
      setTimeout(() => process.exit(1), 1000);
      break;
  }
});

udp.open();

let self = "O";
// Player related variables
const playerTokens = ["O", "X"];
let activePlayer = true;
let activePlayerToken = " ";

// Game related variables
let gameOver = false;
let board = [
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
const renderBoard = (needsPointer = true) => {
  console.clear(); //clear board before re-rendering
  const chalkBoard = board.map((rowVal, row) =>
    rowVal.map((colVal, col) =>
      row == pointer[0] && col == pointer[1] && needsPointer
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

function takeTurn() {
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

  renderBoard(false);

  let returnData;
  if (gameOver) {
    let win = !drawCondition ? `${activePlayerToken} won!!!` : "Draw";
    returnData = {
      address: "/gameover",
      args: JSON.stringify({ board, activePlayer, win }),
    };
    console.log(win);
  } else {
    returnData = {
      address: "/turn",
      args: JSON.stringify({ board, activePlayer }),
    };
  }

  udp.send(returnData);

  if (gameOver) setTimeout(() => process.exit(1), 1000);
}
