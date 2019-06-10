//
// Copyright Platformers (C) 2019
//

const B = require('../index');

test('B.number.round()', () => {
  expect(B.number.round0(1.555555555)).toBe('2');
  expect(B.number.round1(1.555555555)).toBe('1.6');
  expect(B.number.round2(1.555555555)).toBe('1.56');

  expect(B.number.round0(undefined)).toBe('0');
  expect(B.number.round0(null)).toBe('0');
  expect(B.number.round0(NaN)).toBe('0');
  expect(B.number.round0('')).toBe('0');
  expect(B.number.round0([])).toBe('0');
  expect(B.number.round0({})).toBe('0');
  expect(B.number.round0(function(){})).toBe('0');

  expect(B.number.round1(undefined)).toBe('0.0');
  expect(B.number.round1(null)).toBe('0.0');
  expect(B.number.round1(NaN)).toBe('0.0');
  expect(B.number.round1('')).toBe('0.0');
  expect(B.number.round1([])).toBe('0.0');
  expect(B.number.round1({})).toBe('0.0');
  expect(B.number.round1(function(){})).toBe('0.0');

  expect(B.number.round2(undefined)).toBe('0.00');
  expect(B.number.round2(null)).toBe('0.00');
  expect(B.number.round2(NaN)).toBe('0.00');
  expect(B.number.round2('')).toBe('0.00');
  expect(B.number.round2([])).toBe('0.00');
  expect(B.number.round2({})).toBe('0.00');
  expect(B.number.round2(function(){})).toBe('0.00');
});

test('B.number.commify()', () => {
  expect(B.number.commify(123456789.123456)).toBe('123,456,789.123456');
  expect(B.number.commify0(123456789.123456)).toBe('123,456,789');
  expect(B.number.commify1(123456789.123456)).toBe('123,456,789.1');
  expect(B.number.commify2(123456789.123456)).toBe('123,456,789.12');
});

test('B.number.currency()', () => {
  expect(B.number.currency(1234)).toBe('$1,234.00');
  expect(B.number.currency(0)).toBe('$0.00');
  expect(B.number.currency('')).toBe('$0.00');
  expect(B.number.currency({})).toBe('$0.00');
  expect(B.number.currency([])).toBe('$0.00');
});
