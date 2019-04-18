//
// Given a date and time, return just the time component (milliseconds)
//
function getTimeInDay(time) {
  var d = new Date(time);
  return (d.getUTCHours() * 60 * 60 * 1000) +
    (d.getUTCMinutes() * 60 * 1000) +
    (d.getUTCSeconds() * 1000) +
    d.getUTCMilliseconds();
}
