//
// Copyright Platformers (C) 2019
//

const date = {
  //
  // Given a date and time (ms), return just the time component (milliseconds)
  //
  getTimeInDay(time) {
    const d = new Date(time);

    return (d.getUTCHours() * 60 * 60 * 1000) +
      (d.getUTCMinutes() * 60 * 1000) +
      (d.getUTCSeconds() * 1000) +
      d.getUTCMilliseconds();
  },

  now() {
    return new Date().getTime();
  },

  today() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
};

module.exports = date;
