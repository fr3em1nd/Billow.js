//
// Copyright Platformers (C) 2019
//

const B = require('../index');

test('B.util.func()', () => {
  expect(B.util.func('test', ['foo', 'bar'])).toBe('test(foo,bar)');
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
});
