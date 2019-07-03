//
// Copyright Platformers (C) 2019
//

const B = require('../index');

test('B.format.shortDate()', () => {
  expect(B.format.shortDate(0)).toBe('01/01/1970');
  expect(B.format.shortDate(undefined)).toBe('01/01/1970');
  expect(B.format.shortDate(null)).toBe('01/01/1970');
  expect(B.format.shortDate(1560854820951)).toBe('18/06/2019');
});

test('B.format.shortTime()', () => {
  const today = B.date.today();
  expect(B.format.shortTime(today + 3600000 * 0)).toBe('12:00am');
  expect(B.format.shortTime(today + 3600000 * 1)).toBe('1:00am');
  expect(B.format.shortTime(today + 3600000 * 2)).toBe('2:00am');
  expect(B.format.shortTime(today + 3600000 * 3)).toBe('3:00am');
  expect(B.format.shortTime(today + 3600000 * 4)).toBe('4:00am');
  expect(B.format.shortTime(today + 3600000 * 5)).toBe('5:00am');
  expect(B.format.shortTime(today + 3600000 * 6)).toBe('6:00am');
  expect(B.format.shortTime(today + 3600000 * 7)).toBe('7:00am');
  expect(B.format.shortTime(today + 3600000 * 8)).toBe('8:00am');
  expect(B.format.shortTime(today + 3600000 * 9)).toBe('9:00am');
  expect(B.format.shortTime(today + 3600000 * 10)).toBe('10:00am');
  expect(B.format.shortTime(today + 3600000 * 11)).toBe('11:00am');
  expect(B.format.shortTime(today + 3600000 * 12)).toBe('12:00pm');
  expect(B.format.shortTime(today + 3600000 * 13)).toBe('1:00pm');
  expect(B.format.shortTime(today + 3600000 * 14)).toBe('2:00pm');
  expect(B.format.shortTime(today + 3600000 * 15)).toBe('3:00pm');
  expect(B.format.shortTime(today + 3600000 * 16)).toBe('4:00pm');
  expect(B.format.shortTime(today + 3600000 * 17)).toBe('5:00pm');
  expect(B.format.shortTime(today + 3600000 * 18)).toBe('6:00pm');
  expect(B.format.shortTime(today + 3600000 * 19)).toBe('7:00pm');
  expect(B.format.shortTime(today + 3600000 * 20)).toBe('8:00pm');
  expect(B.format.shortTime(today + 3600000 * 21)).toBe('9:00pm');
  expect(B.format.shortTime(today + 3600000 * 22)).toBe('10:00pm');
  expect(B.format.shortTime(today + 3600000 * 23)).toBe('11:00pm');
  expect(B.format.shortTime(today + 3600000 * 24)).toBe('12:00am');
});

test('B.format.capitalise()', () => {
  expect(B.format.capitalise('test')).toBe('Test');
  expect(B.format.capitalise('test test test')).toBe('Test test test');
  expect(B.format.capitalise('')).toBe('');
});

test('B.format.title()', () => {
  expect(B.format.title('test')).toBe('Test');
  expect(B.format.title('test test test')).toBe('Test Test Test');
});

test('B.format.distance()', () => {
  for (let i = 1; i < 1000; i++) {
    expect(B.format.distance(i)).toBe(i + 'm');
  }
  expect(B.format.distance(1000)).toBe('1.0km');
  expect(B.format.distance(5000)).toBe('5.0km');
  expect(B.format.distance(5000000)).toBe('5,000.0km');
});

test('B.format.multiValue()', () => {
  expect(B.format.multiValue('one|two|three')).toBe('one, two, three');
});
