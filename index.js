const GameStatus = {
  BEFORE: 0,
  GAME: 1,
  AFTER: 2,
}

const colors = [
  '#D60E82',
  '#C81430',
  '#00C8D6',
  '#1CA814',
  '#E2D529',
  '#721D32',
  '#570082',
]

const shapes = [
  // L
  [
    [0,0,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
  ],
  // J
  [
    [0,0,0,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,1,1,0],
  ],
  // S
  [
    [0,0,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,1,0],
  ],
  // Z
  [
    [0,0,0,0],
    [0,0,1,0],
    [0,1,1,0],
    [0,1,0,0],
  ],
  // I
  [
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
  ],
  // O
  [
    [0,0,0,0],
    [0,1,1,0],
    [0,1,1,0],
    [0,0,0,0],
  ],
  // T
  [
    [0,0,0,0],
    [0,0,1,0],
    [0,1,1,1],
    [0,0,0,0],
  ],
]

const boardWidth = 10
const boardHeight = 20

const makeBoard = (width, height) => {
  const board = []
  for (let i = 0; i < width; i++) {
    const row = []
    for (let j = 0; j < height; j++) {
      row.push(null)
    }
    board.push(row)
  }

  return board
}

const initialState = {
  gameStatus: GameStatus.BEFORE,
  board: makeBoard(boardWidth, boardHeight),
}

const rotate = shape => {
  const n = shape.length - 1

  return shape.map((row, i) =>
    row.map((_, j) =>
      shape[n - j][i]
    )
  )
}

module.exports = {
  initialState,
  makeBoard,
  shapes,
  colors,
  boardWidth,
  boardHeight,
  rotate,
}
