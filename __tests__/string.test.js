//
// Copyright Billow Software (C) 2019
//

const B = require('../index');

test('B.string.padStart() and B.string.padEnd()', () => {
  expect(B.string.padStart(10, 3)).toBe('010');
  expect(B.string.padStart(100, 5)).toBe('00100');
  expect(B.string.padStart(555, 10)).toBe('0000000555');
  expect(B.string.padEnd(10, 3)).toBe('100');
  expect(B.string.padEnd(100, 5)).toBe('10000');
  expect(B.string.padEnd(555, 10)).toBe('5550000000');
});

test('B.string.pluralise()', () => {
  expect(B.string.pluralise('fuck', 'fucks', 0)).toBe('fucks');
  expect(B.string.pluralise('fuck', 'fucks', 1)).toBe('fuck');
  expect(B.string.pluralise('fuck', 'fucks', 2)).toBe('fucks');
  expect(B.string.pluralise('fuck', 'fucks', 0, true)).toBe('0 fucks');
  expect(B.string.pluralise('fuck', 'fucks', 1, true)).toBe('1 fuck');
  expect(B.string.pluralise('fuck', 'fucks', 2, true)).toBe('2 fucks');
});
