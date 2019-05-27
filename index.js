//
// Copyright Platformers (C) 2019
//

var B = {
  date: {},
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// DATE
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.date.SECOND = 1000;
B.date.MINUTE = 1000 * 60;
B.date.HOUR = 1000 * 60 * 60;
B.date.DAY = 1000 * 60 * 60 * 24;
B.date.WEEK = 1000 * 60 * 60 * 24 * 7;

B.date.getTimeInDay = function(time) {
  var d = new Date(time);
  return d.getTime() % B.date.DAY;
};

B.date.now = function() {
  return (new Date()).getTime();
};

B.date.today = function() {
  var now = new Date();
  var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return d.getTime();
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Magically export B to the right places
//
////////////////////////////////////////////////////////////////////////////////////////////////////
if (global || (module && module.exports)) {
  console.info('Attaching B.js to the module.exports object');
  module.exports = B;
} else {
  console.info('Attaching B.js to the window object');
  window.B = B;
}
