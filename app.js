const gamesBoardContainer = document.querySelector("#gamesboard-container");
const optionContainer = document.querySelector(".option-container");
const flipButton = document.querySelector("#flip-button");
const startButton = document.querySelector("#start-button");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");

//-------Options Choosing----------->
let angle = 0;
function flip() {
  // console.log(Array.from(optionContainer.children))
  // if( angle === 0 ){
  //   angle = 90
  // }else {
  //   angle = 0
  // }
  angle = angle === 0 ? 90 : 0;
  const optionShips = Array.from(optionContainer.children);
  optionShips.forEach(
    (optionShip) => (optionShip.style.transform = `rotate(${angle}deg)`)
  );
}
flipButton.addEventListener("click", flip);

//------< Creating Boards >---------->
const width = 10;
function createBoard(color, user) {
  let gameBoardContainer = document.createElement("div");
  gameBoardContainer.classList.add("game-board");
  gameBoardContainer.style.backgroundColor = color;
  gameBoardContainer.id = user;

  for (let i = 0; i < width * width; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.id = i;
    gameBoardContainer.append(block);
  }

  gamesBoardContainer.append(gameBoardContainer);
}
createBoard("yellow", "player");
createBoard("pink", "computer");

//------< Creating Boards >---------->
class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 4);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;

function getValidity(allBoardBlocks, ship, isHorizontal, startIndex) {
  let validStart = isHorizontal
    ? startIndex <= width * width - ship.length
      ? startIndex
      : width * width - ship.length
    : // handle vertical
    startIndex <= width * width - width * ship.length
    ? startIndex
    : startIndex - ship.length * width + width;

  let shipBlocks = [];

  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]);
    }
  }
  let valid;

  if (isHorizontal) {
    valid = shipBlocks.every(
      (_shipBlock, index) =>
        shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1))
    );
  } else {
    valid = shipBlocks.every(
      (_shipBlock, index) => shipBlocks[0].id < 90 + (width * index + 1)
    );
  }

  const notTaken = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains("taken")
  );
  return { shipBlocks, valid, notTaken };
}

function addShipPiece(user, ship, startId) {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
  // let randomStartIndex = Math.floor(Math.random() * allBoardBlocks.length);
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId ? startId : randomStartIndex;

  const { shipBlocks, valid, notTaken } = getValidity(
    allBoardBlocks,
    ship,
    isHorizontal,
    startIndex
  );

//---------< limits handle >------------------->

  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add(ship.name);
      shipBlock.classList.add("taken");
    });
  } else {
    if (user === "computer") addShipPiece(user, ship, startId);
    if (user === "player") notDropped = true;
  }
}


ships.forEach((ship) => addShipPiece("computer", ship));

//------< Drag player ships >------------------>

let draggedShip;

const optionsShips = Array.from(optionContainer.children);
optionsShips.forEach((optionShip) =>
  optionShip.addEventListener("dragstart", dragStart)
);

const allPlayerBlocks = document.querySelectorAll("#player, div");
allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", dropShip);
});

function dragStart(e) {
  // console.log(e.target)
  notDropped = false;
  draggedShip = e.target;
}

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  highlightAreas(e.target.id, ship);
}

function dropShip(e) {
  const startId = e.target.id;
  const ship = ships[draggedShip.id];
  addShipPiece("player", ship, startId);
  if (!notDropped) {
    draggedShip.remove();
  }
}



function highlightAreas(startIndex, ship) {
  const allBoardBlocks = document.querySelectorAll("#player div");
  let isHorizontal = angle === 0;
  const { shipBlocks, valid, notTaken } = getValidity(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );
  if (valid && notTaken) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add("hover");
      setTimeout(() => shipBlock.classList.remove("hover"), 2000);
    });
  }
}

let gameOver = false;
let playerTurn;




//-----< start game >-------->
function startGame() {

  if (playerTurn === undefined) {

    if (optionContainer.children.length != 0) {
      infoDisplay.textContent = "Por favor coloca todas tus piezas en el tablero";
    } else {
          const allBoardBlocks = document.querySelectorAll("#computer div");
          allBoardBlocks.forEach(block => block.addEventListener("click", handleClick))
          playerTurn = true;
          turnDisplay.textContent = "Es tu turno";
          infoDisplay.textContent = "El juego ha comenzado!";
    }
  }
}

startButton.addEventListener("click", startGame);




//------< Booms player >---------------------------->
let playerHits = [];
let computerHits = [];
let playerSunkShips = [];
let computerSunkShips = [];



function handleClick(e) {
  if (!gameOver) {
    if (e.target.classList.contains("taken")) {
      e.target.classList.add("boom");
      infoDisplay.textContent = "Le diste a un barco de Computer!!!";

      let classes = Array.from(e.target.classList);
      
      
      classes = classes.filter(className => className !== "block");
      classes = classes.filter(className => className !== "boom");
      classes = classes.filter(className => className !== "taken");
      playerHits.push(...classes);
      console.log('playerHits', playerHits)
      checkScore("player", playerHits, playerSunkShips);
    }

    if (!e.target.classList.contains("taken")) {
      infoDisplay.textContent = "No has acertado";
      e.target.classList.add("empty");
    }
    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll("#computer div");
    allBoardBlocks.forEach((block) => block.replaceWith(block.cloneNode(true)));
    setTimeout(computerGo, 3000);
  }
}

//------< computer turn >-------------------->
function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = "Juega Computer!";
    infoDisplay.textContent = "Computer está pensando...";

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);
      const allBoardBlocks = document.querySelectorAll("#player div");

      if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        computerGo();
        return;
      } else if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        !allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        allBoardBlocks[randomGo].classList.add("boom");
        infoDisplay.textContent = "Computer le ha dado a un barco!";
        let classes = Array.from(allBoardBlocks[randomGo].classList);  
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        computerHits.push(...classes);
        
        checkScore("computer", computerHits, computerSunkShips)
      
      } else {
        infoDisplay.textContent = "Nada por ahora!"
        allBoardBlocks[randomGo].classList.add("empty");
      }
    }, 1000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = "Es tu turno!";
      turnDisplay.textContent = "Adelante!";
      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach(block => block.addEventListener("click", handleClick)
      );
    }, 3000);
  }
}

//------< Check score user> ------------------------------->
function checkScore(user, userHits, userSunkShips) {
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
    ) {
      infoDisplay.textContent = `algo`
    }
    if (user === "player") {
      infoDisplay.textContent = `Has hundido un ${shipName} de Computer`
      playerHits = userHits.filter(storedShipName => storedShipName !== shipName);
    }
    if (user === "computer") {
      infoDisplay.textContent = `Computer ha hundido un ${shipName} tuyo`
      computerHits = userHits.filter(storedShipName => storedShipName !== shipName);
    }
    userSunkShips.push(shipName);
  }

  checkShip("destroyer", 2);
  checkShip("submarine", 3);
  checkShip("cruiser", 3);
  checkShip("battleship", 4);
  checkShip("carrier", 5);

  console.log("playerHist", playerHits);
  console.log("playerSunkShips", playerSunkShips);

  if (playerSunkShips.length === 5) {
    infoDisplay.textContent = "Has hundido todos los barcos de tu oponente. GANASTE!";
    gameOver = true;
  }
  if (computerSunkShips.length === 5) {
    infoDisplay.textContent = "Tu oponente hundió toda tu flota. PERDISTE!";
    gameOver = true;
  }
}
