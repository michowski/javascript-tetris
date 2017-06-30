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
const boardHeight = 24

const emptyLine = n => Array(n).fill(-1)

const randomInt = n => Math.floor(Math.random() * (n + 1))

const makeInitialState = () => ({
  gameStatus: GameStatus.BEFORE,
  board: makeBoard(boardWidth, boardHeight),
  player: makePlayer(),
  score: 0,
})

const makePlayer = () => {
  const ind = randomInt(shapes.length - 1)

  return {
    position: [randomInt(boardWidth - 4 - 1), 0],
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

    const newBoard = [...board].map(row => [...row])
    const [x, y] = player.position

    player.shape.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell !== 0) {
          newBoard[i + y][j + x] = player.color
        }
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

const renderBlockToArea = ctx => area => (color, [x, y]) => {
  ctx.beginPath()
  ctx.rect(area.x + area.blockSize * x, area.y + area.blockSize * y, area.blockSize, area.blockSize)
  ctx.fillStyle = colors[color]
  ctx.fill()
}

const renderToContext = (ctx, width, height) => state => {
  const {
    player,
    board,
    score,
    gameStatus,
  } = state

  const boardW = boardWidth
  const boardH = boardHeight - 4

  const proportion = width / height
  const reqProportion = boardW / boardH

  const area = (proportion >= reqProportion) 
    ? {
      x: (width - boardW * (height / boardH)) / 2,
      y: 0,
      blockSize: Math.ceil(height / boardH),
    }
    : {
      x: 0,
      y: (height - boardH * (width / boardW)) / 2,
      blockSize: Math.ceil(width / boardW),
    }

  ctx.beginPath()
  ctx.rect(area.x, area.y, area.blockSize * boardW, area.blockSize * boardH)
  ctx.fillStyle = '#000'
  ctx.fill()

  const renderBlock = renderBlockToArea(ctx)(area)

  if (board) {
    board.slice(4).forEach((row, i) => 
      row.forEach((color, j) => {
        if (color !== -1) {
          renderBlock(color, [j, i])
        }
      })
    )
  }

  if (player) {
    const [playerX, playerY] = player.position
    player.shape.forEach((row, i) => 
      row.forEach((el, j) => {
        if (el !== 0) {
          renderBlock(player.color, [playerX + j, playerY + i - 4])
        }
      })
    )
  }
}

const update = state => {
  const {
    player,
    board,
    score,
    gameStatus,
  } = state
  
  if (gameStatus === GameStatus.BEFORE || gameStatus === GameStatus.AFTER) {
    return state
  }

  const res = step(board, player)

  return {
    gameStatus,
    score: score + res.removedLines,
    player: player ? res.player : makePlayer(),
    board: res.board,
  }
}

const main = () => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  const width = document.body.clientWidth
  const height = document.body.clientHeight

  canvas.width = width
  canvas.height = height

  const render = renderToContext(ctx, width, height)

  let state = makeInitialState()

  document.addEventListener('keyup', e => {
    if (state.gameStatus === GameStatus.BEFORE || state.gameStatus === GameStatus.AFTER) {
      state.gameStatus = GameStatus.GAME
      return
    }

    const {player, board} = state

    if (!player) {
      return
    }

    if (e.keyCode === 38) {
      const newShape = rotate(state.player.shape)
      if (move({
        board,
        shape: newShape,
        position: player.position,
        vector: [0, 0],
      }).free) {
        state.player.shape = newShape
      }
      return
    }

    const vector = (e.keyCode === 37) ? [-1, 0]
      : (e.keyCode === 39) ? [1, 0] 
      : (e.keyCode === 40) ? [0, 1]
      : null
    
    if (vector) {
      state.player.position = move({
        board,
        shape: player.shape,
        position: player.position,
        vector,
      }).position
    }
  })

  setInterval(() => {
    state = update(state)
  }, 400)

  setInterval(() => {
    render(state)
  }, 1000 / 30)
}

if (typeof module !== 'undefined') {
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
}
