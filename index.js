//
// Copyright Platformers (C) 2019
//

var Billow = {};

Billow.date = {
  SECOND: 1000,
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24,
  WEEK: 1000 * 60 * 60 * 24 * 7,

  getTimeInDay: function(time) {
    var d = new Date(time);
    return d.getTime() % Billow.date.DAY;
  },

  now: function() {
    return (new Date()).getTime();
  },

  today: function() {
    var now = new Date();
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return d.getTime();
  }
};

module.exports = Billow;
