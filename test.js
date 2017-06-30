const test = require('tape')

const {
  rotate,
  shapes,
  colors,
  makeBoard,
  move,
  step,
} = require('./index.js')

const compose = (...fs) => x => fs.reduce((acc, f) => f(acc), x)

const boardFromStr = str => str
  .trim()
  .split('\n')
  .map(line => line
    .trim()
    .split('')
    .map(x => x == 'X' ? -1 : parseInt(x))
  )

test('move', t => {
  const cases = [
    {
      msg: 'can move down if there is a free space, L shape',
      input: {
        shape: [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 1, 0],
        ],
        board: boardFromStr(`
          XXXXXXXXXX
          XXXXXXXXXX
          XXXXX1XXXX
          XXXXXXXXXX
          1111XX1111
          1111XX1111
          1111111111
          1111111111
        `),
        position: [3, 1],
        vector: [0, 1],
      },
      expected: {
        free: true,
        position: [3, 2],
      },
    },
    {
      msg: 'can move right if there is a free space, T shape',
      input: {
        shape: [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 0, 0],
        ],
        board: boardFromStr(`
          XXXXXXXXX
          XXXXXXXXX
          XXX322223
          XXX322223
          XX1122223
          111122223
        `),
        position: [-1, 1],
        vector: [1, 0],
      },
      expected: {
        free: true,
        position: [0, 1],
      },
    },
    {
      msg: 'can not move right if there is an obstacle, T shape',
      input: {
        shape: [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 0, 0],
        ],
        board: boardFromStr(`
          XXXXXXXXX
          XXXXXXXXX
          XXX322223
          XXX322223
          XX1122223
          111122223
        `),
        position: [0, 1],
        vector: [1, 0],
      },
      expected: {
        free: false,
        position: [0, 1],
      },
    },
    {
      msg: 'can not move outside of board',
      input: {
        shape: [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
        board: boardFromStr(`
          XXXXXXX33
          XXXXXXX22
          XXXXXXX22
          XXXXXXX11
          XXXXXXX11
          XXXXXXX11
          XXXXXXX11
          XXXXXXX11
          XXXXXXX11
          XXXXXXX11
          111111111
        `),
        position: [-1, 3],
        vector: [-1, 0],
      },
      expected: {
        free: false,
        position: [-1, 3],
      },
    },
  ]

  for (let {input, expected, msg} of cases) {
    const actual = move(input)

    t.deepEqual(actual, expected, msg)
  }

  t.end()
})

test('boardFromStr', t => {
  t.test('generates board from string', t => {
    const input = `
      XXXX0
      X1XXX
      XXXXX
      XXXXX
      1XX2X
      XX1XX
    `

    const actual = boardFromStr(input)
    const expected = [
      [-1, -1, -1, -1, 0],
      [-1, 1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [1, -1, -1, 2, -1],
      [-1, -1, 1, -1, -1],
    ]

    t.deepEqual(actual, expected)
    t.end()
  })
})

test('makeBoard', t => {
  t.test('creates array of -1', t => {
    const actual = makeBoard(2, 3)
    const expected = [
      [-1, -1],
      [-1, -1],
      [-1, -1],
    ]

    t.deepEqual(actual, expected)
    t.end()
  })
})

test('step', t => {
  t.test('removes full lines', t => {
    t.test('case: nothing to remove', t => {
      const board = boardFromStr(`
        XXXX
        1XXX
        X2X1
        X111
      `)
      const player = null

      const res = step(board, player)

      const actual = {
        removedLines: res.removedLines,
        board: res.board,
      }
      const expected = {
        board,
        removedLines: 0,
      }      

      t.deepEqual(actual, expected)
      t.end()
    })

    t.test('case: 2 sibling lines to remove', t => {
      const board = boardFromStr(`
        XXXXXXX
        1XX33XX
        XX33XXX
        1111113
        1123221
        012301X
      `)
      const player = null

      const res = step(board, player)

      const actual = {
        removedLines: res.removedLines,
        board: res.board,
      }
      const expected = {
        removedLines: 2,        
        board: boardFromStr(`
          XXXXXXX
          XXXXXXX
          XXXXXXX
          1XX33XX
          XX33XXX
          012301X
        `),
      }

      t.deepEqual(actual, expected)
      t.end()
    })

    t.test('case: 3 lines in different places', t => {
      const board = boardFromStr(`
        11111000
        XXXXX2XX
        33333333
        13333X11
        11111X1X
        01010102
        X000XXXX
      `)
      const player = null

      const res = step(board, player)

      const actual = {
        removedLines: res.removedLines,
        board: res.board,
      }
      const expected = {
        removedLines: 3,
        board: boardFromStr(`
          XXXXXXXX
          XXXXXXXX
          XXXXXXXX
          XXXXX2XX
          13333X11
          11111X1X
          X000XXXX
        `),
      }

      t.deepEqual(actual, expected)
      t.end()
    })
  })

  t.test('moves player down if that is possible', t => {
    t.test('case: simple ground, T shape', t => {
      const player = {
        position: [2, 0],
        shape: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [1, 1, 1, 0],
          [0, 1, 0, 0],
        ],
        color: 2,
      }
      const board = boardFromStr(`
        XXXXXXXX
        XXXXXXXX
        XXXXXXXX
        XXXXXXXX
        XXXXXXXX
        10101010
        01010101
      `)

      const actual = step(board, player)
      const expected = {
        board,
        removedLines: 0,
        player: {
          position: [2, 1],
          shape: player.shape,
          color: player.color,
        },
      }

      t.deepEqual(actual, expected)
      t.end()
    })

    t.test('case: obstacles around player, Z shape', t => {
      const player = {
        position: [0, 0],
        shape: [
          [0, 0, 0, 0],
          [0, 0, 1, 0],
          [0, 1, 1, 0],
          [0, 1, 0, 0],
        ],
        color: 2,        
      }
      const board = boardFromStr(`
        XXXXXXXX
        XXXXXXXX
        XXX11111
        XXX11111
        1X1XXXX1
        11111111
        11111111
      `)

      const actual = step(board, player)
      const expected = {
        board,
        removedLines: 0,
        player: {
          position: [0, 1],
          shape: player.shape,
          color: player.color,
        },
      }

      t.deepEqual(actual, expected)
      t.end()      
    })
  })

  t.test('attaches player to board if he can not move down', t => {
    t.test('correctly converts shape and color of player to board', t => {
      const player = {
        position: [0, 1],
        shape: [
          [0, 0, 0, 0],
          [0, 0, 1, 0],
          [0, 1, 1, 0],
          [0, 1, 0, 0],
        ],
        color: 0,
      }
      const board = boardFromStr(`
        XXXXXXXX
        XXXXXXXX
        XXX11111
        XXX11111
        1X1XXXX1
        11111111
        11111111
      `)

      const actual = step(board, player)
      const expected = {
        board: boardFromStr(`
          XXXXXXXX
          XXXXXXXX
          XX011111
          X0011111
          101XXXX1
          11111111
          11111111
        `),
        removedLines: 0,
        player: null,
      }

      t.deepEqual(actual, expected)
      t.end()
    })
  })
})

test('colors', t => {
  t.test('amount matches shapes amount', t => {
    const actual = (colors.length >= shapes.length)
    const expected = true

    t.equal(
      actual,
      expected,
      `There should be at least as many colors as there are shape variants.`
    )
    t.end()
  })

  t.test('are in #hex notation', t => {
    const actual = colors.every(c => c.length === 7 && c[0] === '#')
    const expected = true

    t.equal(
      actual,
      expected
    )
    t.end()
  })
})

test('rotate', t => {
  t.test('returns same result after rotating 4 times (random shape)', t => {
    const shape = []
    for (let i = 0; i < 4; i++) {
      const row = []
      for (let j = 0; j < 4; j++) {
        row.push((Math.random() > 0.5) ? 1 : 0)
      }
      shape.push(row)
    }

    const actual = compose(rotate, rotate, rotate, rotate)(shape)
    const expected = shape

    t.deepEqual(actual, expected)
    t.end()
  })

  t.test('is identity function for square shape', t => {
    const shape = [
      [0,0,0,0],
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
    ]
    const actual = rotate(shape)
    const expected = shape

    t.deepEqual(actual, expected)
    t.end()
  })

  t.test('rotates clock-wise S shape', t => {
    const shape = [
      [0,0,0,0],
      [0,1,0,0],
      [0,1,1,0],
      [0,0,1,0],
    ]

    const expectedList = [
      [
        [0,0,0,0],
        [0,1,1,0],
        [1,1,0,0],
        [0,0,0,0],
      ],
      [
        [0,1,0,0],
        [0,1,1,0],
        [0,0,1,0],
        [0,0,0,0],
      ],
      [
        [0,0,0,0],
        [0,0,1,1],
        [0,1,1,0],
        [0,0,0,0],
      ],
      [
        [0,0,0,0],
        [0,1,0,0],
        [0,1,1,0],
        [0,0,1,0],
      ],
    ]

    let actual = shape
    for (let i = 0; i < 4; i++) {
      actual = rotate(actual)
      const expected = expectedList[i]

      t.deepEqual(actual, expected, `${i+1}. rotation`)
    }

    t.end()
  })
})
