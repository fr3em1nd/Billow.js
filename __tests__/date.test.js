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
