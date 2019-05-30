//
// Copyright Platformers (C) 2019
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
