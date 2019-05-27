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

B.date = {};

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

//
// Converts a date to a string more appropriate for display to the user (14 July 2017)
//
B.date.commonDateString = function(date) {
  var dateString = "";
  var tempDate = date;

  if (!(date instanceof Date))
    tempDate = new Date(parseInt(date));

  dateString = tempDate.toString().split(" ");
  dateString = dateString[2] + " " + dateString[1] + " " + dateString[3];

  return dateString;
}

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
