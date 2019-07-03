//
// Copyright Platformers (C) 2019
//

const B = require('../index');

test('B.util.func()', () => {
  expect(B.util.func('test', ['foo', 'bar'])).toBe('test(foo,bar)');
});

test('B.util.engineCall()', () => {
  expect(B.util.engineCall('test', ['foo', 'bar'])).toBe("Engine.eval('test(foo,bar)')");
});

test('B.util.createIn()', () => {
  expect(B.util.createIn('name', ['Foo', 'Bar', 'Baz'])).toEqual("name IN ('Foo', 'Bar', 'Baz')");
});

test('B.util.pluck()', () => {
  const collection = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
  ];

  expect(B.util.pluck(collection, 'id')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(B.util.pluck(collection.reverse(), 'id')).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
});

test('B.util.esc()', () => {
  expect(B.util.esc('test')).toBe("'test'");
  expect(B.util.esc(500)).toBe("'500'");
  expect(B.util.esc({})).toBe("''");
});

test('B.util.ensureDateObj()', () => {
  const d = new Date();
  const now = d.getTime();

  expect(B.util.ensureDateObj(d)).toEqual(d);
  expect(B.util.ensureDateObj(now)).toEqual(d);
});

test('B.util.each()', () => {
  const times = 500;
  const arr = new Array(times);
  let count = 0;

  B.util.each(arr, () => {
    count += 1;
  });

  expect(count).toEqual(times);
});

test('B.util.map()', () => {
  const list = [1, 2, 3, 4, 5];
  const obj = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  expect(B.util.map(list, num => num * 2)).toEqual([2, 4, 6, 8, 10]);
  expect(B.util.map(obj, num => num * 2)).toEqual({
    one: 2,
    two: 4,
    three: 6,
    four: 8,
    five: 10,
  });
});

test('B.util.expand()', () => {
  const list = [
    { num: 1 },
    { num: 2 },
    { num: 3 },
    { num: 4 },
    { num: 5 },
  ];

  expect(B.util.expand(list, 'num')).toEqual({
    '1': { num: 1 },
    '2': { num: 2 },
    '3': { num: 3 },
    '4': { num: 4 },
    '5': { num: 5 },
  });
});

test('B.util.expandList()', () => {
  const list = [
    { num: 1 },
    { num: 1 },
    { num: 2 },
    { num: 2 },
    { num: 3 },
    { num: 4 },
    { num: 5 },
  ];

  expect(B.util.expandList(list, 'num')).toEqual({
    '1': [{ num: 1 }, { num: 1 }],
    '2': [{ num: 2 }, { num: 2 }],
    '3': [{ num: 3 }],
    '4': [{ num: 4 }],
    '5': [{ num: 5 }],
  });
});

test('B.util.isEmpty()', () => {
  expect(B.util.isEmpty([])).toBe(true);
  expect(B.util.isEmpty({})).toBe(true);
  expect(B.util.isEmpty(null)).toBe(true);
  expect(B.util.isEmpty(undefined)).toBe(true);
  expect(B.util.isEmpty(0)).toBe(false);
  expect(B.util.isEmpty([0])).toBe(false);
  expect(B.util.isEmpty({test: 'yes'})).toBe(false);
  expect(B.util.isEmpty(function(){})).toBe(false);
  expect(B.util.isEmpty('test')).toBe(false);
  expect(B.util.isEmpty(new Date())).toBe(false);
  expect(B.util.isEmpty(module)).toBe(false);
});
