//
// Copyright Platformers (C) 2019
//

const Billow = require('./../index');

test('Billow.date.getTimeInDay', () => {
  expect(Billow.date.getTimeInDay(1555595113082)).toEqual(49513082);
  expect(Billow.date.getTimeInDay(0)).toEqual(0);
  expect(Billow.date.getTimeInDay(Billow.date.HOUR)).toEqual(Billow.date.HOUR);
  expect(Billow.date.getTimeInDay(Billow.date.HOUR * 25)).toEqual(Billow.date.HOUR);

  const now = Billow.date.now();
  const today = Billow.date.today();
  const tid = now - today + ((new Date()).getTimezoneOffset() * 60 * 1000);
  expect(Billow.date.getTimeInDay(now)).toEqual(tid);
});

test('B.date.commonDateString', () => {
  expect(Billow.date.commonDateString(0)).toBe('01 Jan 1970');
  expect(Billow.date.commonDateString(Billow.date.DAY * 10)).toBe('11 Jan 1970');
  expect(Billow.date.commonDateString(Billow.date.DAY * 100)).toBe('11 Apr 1970');
  expect(Billow.date.commonDateString(Billow.date.DAY * 1000)).toBe('27 Sep 1972');
  expect(Billow.date.commonDateString(Billow.date.DAY * 10000)).toBe('19 May 1997');
  expect(Billow.date.commonDateString(1559213379945)).toBe('30 May 2019');
});
