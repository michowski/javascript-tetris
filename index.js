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

const emptyLine = n => Array(n).fill(-1)

const randomInt = n => Math.floor(Math.random() * (max + 1))

const makeInitialState = () => ({
  gameStatus: GameStatus.BEFORE,
  board: makeBoard(boardWidth, boardHeight),
  player: makePlayer(),
  score: 0,
})

const makePlayer = () => {
  const ind = randomInt(shapes.length)

  return {
    position: [randomInt(boardWidth - 4), -4],
    shape: shapes[ind],
    color: ind,
  }
}

const makeBoard = (width, height) => {
  const board = []
  for (let i = 0; i < height; i++) {
    const row = []
    for (let j = 0; j < width; j++) {
      row.push(-1)
    }
    board.push(row)
  }

  return board
}

const step = (board, player) => {
  if (player) {
    const {free, position} = move({
      board,
      shape: player.shape,
      position: player.position,
      vector: [0, 1],
    })

    // move player down
    if (free) {
      return {
        board,
        player: {
          position,
          shape: player.shape,
          color: player.color, 
        },
        removedLines: 0,
      }
    }

    // attach player to board
    
    const newBoard = [...board]
    const [x, y] = player.position

    player.shape.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === 0) {
          return
        }

        newBoard[i + y][j + x] = player.color
      })
    )

    return {
      removedLines: 0,
      board: newBoard,
      player: null,
    }
  }

  // remove lines

  const acc = board
    .reduce((acc, line, n) => {
      let {removedLines, newBoard} = acc
      
      if (!line.every(x => x !== -1)) {
        newBoard.push(line)
      }
      else {
        removedLines++
      }

      return {
        removedLines,
        newBoard,
      }
    }, {removedLines: 0, newBoard: []})

  const {removedLines, newBoard} = acc

  newBoard.unshift(
    ...Array(removedLines).fill(emptyLine(board[0].length))
  )

  return {
    removedLines,
    board: newBoard,
    player: null,
  }
}

const rotate = shape => {
  const n = shape.length - 1

  return shape.map((row, i) =>
    row.map((_, j) =>
      shape[n - j][i]
    )
  )
}

const move = ({
  shape,
  position,
  board,
  vector,
}) => {
  // new position
  const x = position[0] + vector[0]
  const y = position[1] + vector[1]

  const free = shape.every((row, i) =>
    row.every((_, j) => {
      a = y + i
      b = x + j

      return (row[j] === 0) || (
        a in board
        && b in board[a]
        && board[a][b] === -1
      )
    })
  )

  return {
    free,
    position: free ? [x, y] : position,
  }
}

module.exports = {
  randomInt,
  makePlayer,
  makeInitialState,
  makeBoard,
  shapes,
  colors,
  boardWidth,
  boardHeight,
  rotate,
  move,
  step,
}
