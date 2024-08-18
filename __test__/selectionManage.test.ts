import selectionManage from 'models/SelectionManage/SelectionManage'
test('区间解析', () => {
  expect(selectionManage.parseSelection('0-9')).toEqual({
    startIndex: 0,
    endIndex: 9,
  })
})

test('区间输出', () => {
  expect(
    selectionManage.stringifySelection({
      startIndex: 0,
      endIndex: 9,
    }),
  ).toBe('0-9')
})

test('区间外切', () => {
  expect(
    selectionManage.isExterior(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 9,
        endIndex: 10,
      },
    ),
  ).toBe(true)

  expect(
    selectionManage.isExterior(
      {
        startIndex: 9,
        endIndex: 9,
      },
      {
        startIndex: 9,
        endIndex: 10,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isExterior(
      {
        startIndex: 0,
        endIndex: 10,
      },
      {
        startIndex: 9,
        endIndex: 10,
      },
    ),
  ).toBe(false)
})

test('区间内切', () => {
  expect(
    selectionManage.isInterior(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 3,
        endIndex: 9,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isInterior(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toBe(true)

  expect(
    selectionManage.isInterior(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 3,
        endIndex: 8,
      },
    ),
  ).toBe(false)

  expect(
    selectionManage.isInterior(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 0,
        endIndex: 9,
      },
    ),
  ).toBe(false)
})

test('区间有重叠', () => {
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 2,
        endIndex: 10,
      },
    ),
  ).toBe(false)
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 2,
      },
      {
        startIndex: 2,
        endIndex: 10,
      },
    ),
  ).toBe(false)
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 10,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 0,
        endIndex: 1,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 0,
      },
      {
        startIndex: 0,
        endIndex: 10,
      },
    ),
  ).toBe(false)
  expect(
    selectionManage.isOverlap(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 1,
      },
    ),
  ).toBe(false)
})

test('区间包含于', () => {
  expect(
    selectionManage.isContained(
      {
        startIndex: 5,
        endIndex: 9,
      },
      {
        startIndex: 0,
        endIndex: 10,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isContained(
      {
        startIndex: 0,
        endIndex: 10,
      },
      {
        startIndex: 0,
        endIndex: 10,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isContained(
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 2,
        endIndex: 10,
      },
    ),
  ).toBe(false)
})

test('相同区间', () => {
  expect(
    selectionManage.isSameSelection(
      {
        startIndex: 1,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 1,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isSameSelection(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 0,
        endIndex: 1,
      },
    ),
  ).toBe(true)
  expect(
    selectionManage.isSameSelection(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 1,
      },
    ),
  ).toBe(false)
})

test('区间交集', () => {
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 1,
  })
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 2,
    endIndex: 3,
  })
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 4,
      },
    ),
  ).toEqual({
    startIndex: 2,
    endIndex: 3,
  })
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 3,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.intersect(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 4,
        endIndex: 5,
      },
    ),
  ).toEqual(null)
})

test('区间并集', () => {
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 4,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 4,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 3,
        endIndex: 3,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.union(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 4,
        endIndex: 5,
      },
    ),
  ).toEqual(null)
})

test('区间差集', () => {
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 1,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 1,
        endIndex: 3,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 1,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 1,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 3,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 2,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 0,
        endIndex: 3,
      },
    ),
  ).toEqual(null)
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 2,
        endIndex: 4,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 2,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 3,
        endIndex: 3,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 3,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 3,
      },
      {
        startIndex: 4,
        endIndex: 5,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 3,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 4,
      },
      {
        startIndex: 1,
        endIndex: 3,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 1,
    },
    {
      startIndex: 3,
      endIndex: 4,
    },
  ])
  expect(
    selectionManage.difference(
      {
        startIndex: 0,
        endIndex: 4,
      },
      {
        startIndex: 1,
        endIndex: 1,
      },
    ),
  ).toEqual([
    {
      startIndex: 0,
      endIndex: 1,
    },
    {
      startIndex: 1,
      endIndex: 4,
    },
  ])
})

test('区间合并', () => {
  expect(
    selectionManage.merge(
      {
        startIndex: 0,
        endIndex: 0,
      },
      {
        startIndex: 4,
        endIndex: 7,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
  expect(
    selectionManage.merge(
      {
        startIndex: 0,
        endIndex: 0,
      },
      {
        startIndex: 1,
        endIndex: 1,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 0,
  })
  expect(
    selectionManage.merge(
      {
        startIndex: 4,
        endIndex: 7,
      },
      {
        startIndex: 0,
        endIndex: 0,
      },
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 3,
  })
})

test('区间偏移', () => {
  expect(
    selectionManage.offsetSelection(
      {
        startIndex: 1,
        endIndex: 45,
      },
      [2, 3],
    ),
  ).toEqual({
    startIndex: 3,
    endIndex: 48,
  })
  expect(
    selectionManage.offsetSelection(
      {
        startIndex: 1,
        endIndex: 45,
      },
      [-2, 3],
    ),
  ).toEqual({
    startIndex: 0,
    endIndex: 48,
  })
})
