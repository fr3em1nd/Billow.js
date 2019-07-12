//
// Copyright Platformers (C) 2019
//

const B = require('../index');

test('B.int()', () => {
  expect(B.int(100)).toBe(100);
  expect(B.int(100.00001)).toBe(100);
  expect(B.int(undefined)).toBe(0);
  expect(B.int(null)).toBe(0);
  expect(B.int(NaN)).toBe(0);
  expect(B.int('')).toBe(0);
  expect(B.int([])).toBe(0);
  expect(B.int({})).toBe(0);
  expect(B.int(function(){})).toBe(0);
  expect(B.int('10.1010')).toBe(10);
});

test('B.float()', () => {
  expect(B.float(100)).toBe(100);
  expect(B.float(100.00001)).toBe(100.00001);
  expect(B.float(undefined)).toBe(0);
  expect(B.float(null)).toBe(0);
  expect(B.float(NaN)).toBe(0);
  expect(B.float('')).toBe(0);
  expect(B.float([])).toBe(0);
  expect(B.float({})).toBe(0);
  expect(B.float(function(){})).toBe(0);
  expect(B.float('10.1010')).toBe(10.101);
});

test('B.number()', () => {
  expect(B.num(100)).toBe(100);
  expect(B.num(100.00001)).toBe(100.00001);
  expect(B.num(undefined)).toBe(0);
  expect(B.num(null)).toBe(0);
  expect(B.num(NaN)).toBe(0);
  expect(B.num('')).toBe(0);
  expect(B.num([])).toBe(0);
  expect(B.num({})).toBe(0);
  expect(B.num(function(){})).toBe(0);
  expect(B.num('10.1010')).toBe(10.101);
});

test('B.arr()', () => {
  expect(B.arr(1)).toEqual([1]);
  expect(B.arr([])).toEqual([]);
  var functionList = [
    function(){},
    function(){},
    function(){},
    function(){},
    function(){},
  ];
  expect(B.arr(functionList)).toEqual(functionList);
  expect(B.arr({})).toEqual([{}]);
  expect(B.arr(undefined)).toEqual([]);
  expect(B.arr(null)).toEqual([]);
  expect(B.arr()).toEqual([]);
});

test('B.str()', () => {
  expect(B.str('test')).toBe('test');
  expect(B.str({})).toBe('');
  expect(B.str([])).toBe('');
  expect(B.str(0)).toBe('0');
  expect(B.str(undefined)).toBe('');
  expect(B.str(null)).toBe('');
  expect(B.str(NaN)).toBe('');
  expect(B.str(function(){})).toBe('');
  expect(B.str('0.001')).toBe('0.001');
  expect(B.str(0.001)).toBe('0.001');
});
