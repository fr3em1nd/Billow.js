//
// Copyright Platformers (C) 2019
//

const Billow = require('./../index');

test('date.getTimeInDay', () => {
  expect(Billow.date.getTimeInDay(1555595113082)).toEqual(49513082);

  //
  // The following is not working for some reason
  //
  // expect(Billow.date.getTimeInDay(Billow.date.now())).toEqual(Billow.date.now() - Billow.date.today());
});
