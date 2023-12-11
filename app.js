const gamesBoardContainer = document.querySelector("#gamesboard-container");
const optionContainer = document.querySelector(".option-container");
const flipButton = document.querySelector("#flip-button");
const startButton = document.querySelector("#start-button");
const infoDisplay = document.querySelector("#info");
const turnDisplay = document.querySelector("#turn-display");

//-------Options Choosing----------->
let angle = 0;

let allBoardBlocks;

function flip() {

  angle = angle === 0 ? 90 : 0;
  
  let optionShips = Array.from(optionContainer.children);
      optionShips.forEach(optionShip => (optionShip.style.transform = `rotate(${angle}deg)`)
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
    let block = document.createElement("div");
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

let destroyer = new Ship("destroyer", 2);
let submarine = new Ship("submarine", 3);
let cruiser = new Ship("cruiser", 4);
let battleship = new Ship("battleship", 4);
let carrier = new Ship("carrier", 5);

let ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;
// let allBoardBlocks

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

  let notTaken = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains("taken")
  );
  return { shipBlocks, valid, notTaken };
}

function addShipPiece(user, ship, startId) {
  let allBoardBlocks = document.querySelectorAll(`#${user} div`);
  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user === "player" ? angle === 0 : randomBoolean;
  
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId ? startId : randomStartIndex;

  let { shipBlocks, valid, notTaken } = getValidity(
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

let optionsShips = Array.from(optionContainer.children);
optionsShips.forEach((optionShip) =>
  optionShip.addEventListener("dragstart", dragStart)
);

let allPlayerBlocks = document.querySelectorAll("#player, div");
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
  let ship = ships[draggedShip.id];
  highlightAreas(e.target.id, ship);
}

function dropShip(e) {
  let startId = e.target.id;
  let ship = ships[draggedShip.id];
  addShipPiece("player", ship, startId);
  if (!notDropped) {
    draggedShip.remove();
  }
}



function highlightAreas(startIndex, ship) {
  let allBoardBlocks = document.querySelectorAll("#player div");
  let isHorizontal = angle === 0;
  let { shipBlocks, valid, notTaken } = getValidity(
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




//-----< start game >--------------------------------------------------------->
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


//--------< user turn >------------------------------------>
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
    let allBoardBlocks = document.querySelectorAll("#computer div");
    allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
    setTimeout(computerGo, 2000);
  }
}

//------< computer turn >-------------------->
function computerGo() {
  if (!gameOver) {
    turnDisplay.textContent = "Juega Computer!";
    infoDisplay.textContent = "Computer está pensando...";

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);
      let allBoardBlocks = document.querySelectorAll("#player div");

      if (allBoardBlocks[randomGo].classList.contains("taken") &&
          allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        computerGo();
        return
      } else if (
        allBoardBlocks[randomGo].classList.contains("taken") &&
        !allBoardBlocks[randomGo].classList.contains("boom")
      ) {
        allBoardBlocks[randomGo].classList.add("boom");
        infoDisplay.textContent = "Computer golpeó tu  barco!";
      
        let classes = Array.from(allBoardBlocks[randomGo].classList)
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        computerHits.push(...classes);

        console.log('computerHits', computerHits)
        checkScore("computer", computerHits, computerSunkShips)
      
      } else {
        infoDisplay.textContent = "Nada por ahora!"
        allBoardBlocks[randomGo].classList.add("empty");
      }
    }, 3000);

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = "Es tu turno!";
      infoDisplay.textContent = "Adelante!";
      let allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach(block => block.addEventListener("click", handleClick)
      );
    }, 6000);
  }
}

//------< Check user score > ------------------------------->
function checkScore(user, userHits, userSunkShips) {
  function checkShip(shipName, shipLength) {
    if (  
      userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
      ) {
          infoDisplay.textContent = `You sunk the ${user}´s ${shipName}` 
          if (user === "player") {
              infoDisplay.textContent = `Has hundido un ${shipName} de Computer`
              playerHits = userHits.filter(storedShipName => storedShipName !== shipName);
          }
          if (user === "computer") {
            infoDisplay.textContent = `Computer ha hundido un ${shipName} tuyo`
            computerHits = userHits.filter(storedShipName => storedShipName !== shipName);
          }
          userSunkShips.push(shipName)
        }
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
