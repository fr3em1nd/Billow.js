//
// Copyright Platformers (C) 2019
//

const B = require('./../index');

test('B.date.getTimeInDay', () => {
  expect(B.date.getTimeInDay(1555595113082)).toEqual(49513082);
  expect(B.date.getTimeInDay(0)).toEqual(0);
  expect(B.date.getTimeInDay(B.date.HOUR)).toEqual(B.date.HOUR);
  expect(B.date.getTimeInDay(B.date.HOUR * 25)).toEqual(B.date.HOUR);

  const now = B.date.now();
  const today = B.date.today();
  const tid = now - today + ((new Date()).getTimezoneOffset() * 60 * 1000);
  expect(B.date.getTimeInDay(now)).toEqual(tid);
});

test('B.date.commonDateString', () => {
  expect(B.date.commonDateString(0)).toBe('01 Jan 1970');
  expect(B.date.commonDateString(B.date.DAY * 10)).toBe('11 Jan 1970');
  expect(B.date.commonDateString(B.date.DAY * 100)).toBe('11 Apr 1970');
  expect(B.date.commonDateString(B.date.DAY * 1000)).toBe('27 Sep 1972');
  expect(B.date.commonDateString(B.date.DAY * 10000)).toBe('19 May 1997');
  expect(B.date.commonDateString(1559213379945)).toBe('30 May 2019');
});
