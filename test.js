const test = require('tape')

const {
  rotate,
  shapes,
  colors,
  makeBoard,
} = require('./index.js')

const compose = (...fs) => x => fs.reduce((acc, f) => f(acc), x)

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
