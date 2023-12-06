const gamesBoardContainer = document.querySelector('#gamesboard-container')
const optionContainer = document.querySelector('.option-container')
const flipButton = document.querySelector("#flip-button");


//-------Options Choosing----------->
let angle = 0
function flip()  {
  // console.log(Array.from(optionContainer.children))
  // if( angle === 0 ){
  //   angle = 90
  // }else {
  //   angle = 0
  // }
  angle = angle === 0 ? 90 : 0
  const optionShips = Array.from(optionContainer.children)
  optionShips.forEach(optionShip =>optionShip.style.transform = `rotate(${angle}deg)`)
};
flipButton.addEventListener('click', flip)


//------< Creating Boards >---------->
const width = 10
function createBoard(color, user) {
  let gameBoardContainer = document.createElement('div')
  gameBoardContainer.classList.add('game-board')
  gameBoardContainer.style.backgroundColor = color
  gameBoardContainer.id = user

  for(let i=0; i < width * width; i++){
    const block = document.createElement('div')
    block.classList.add('block')
    block.id = i
    gameBoardContainer.append(block)
  }

  gamesBoardContainer.append(gameBoardContainer)
}
createBoard('yellow', 'player');
createBoard('pink', 'computer');




