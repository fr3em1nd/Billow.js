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
// UTIL
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.util = {};

//
// Convert a float to a string (with a dollar sign, comma separated)
//
B.util.currency = function(number) {
  return '$' + B.util.displayNumberWithCommas(number);
},

//
// Creates a string of a function with paramaters
//
B.util.func = function(functionName, paramaters) {
  return functionName + '(' + paramaters.join(',') + ')';
},

//
// Create an Engine.eval() string with paramaters
//
B.util.engineCall = function(functionName, paramaters) {
  return util._func('Engine.eval', [esc(util._func(functionName, paramaters))]);
},

//
// Converts a number into a string with 2 decimal places
//
B.util._num = function(number) {
  if (!number) {
    return '0.00';
  }

  return parseFloat(number).toFixed(2);
},

//
// Receives a number and displays it with commas to make it more readable
//
B.util.displayNumberWithCommas = function(number) {
  if (isNaN(number) == true) number = 0;
  var components = number.toFixed(2).split(".");
  var result = "";
  var count = 0;
  var negativeNumber = number < 0;

  if (negativeNumber)
    components[0] = components[0].substring(1, number.length);

  for (var i = components[0].length - 1; i >= 0; i -= 1) {
    if (count % 3 == 0 && count != 0)
      result += ",";

    result += components[0].charAt(i);
    count += 1;
  }

  //The string is currently reversed, we need to make sure that we now put it the right way
  result = result.split("").reverse().join("");

  return (negativeNumber ? "-" : "") + result + "." + (components.length > 1 ? components[1] : "00");
}

//
// Creates an array of specified attributes in an array of objects.
//
B.util.pluck = function(arrayOfObjects, key) {
  var result = [];

  for (var i = 0; i < arrayOfObjects.length; i++) {
    var item = arrayOfObjects[i];
    if (item && item[key]) {
      result.push(item[key]);
    }
  }

  return result;
},

//
// Maps over a collection and applies the transformation function. Returns a new array.
//
B.util.map = function(list, mappingFunction) {
  if (!(Array.isArray(list) && typeof mappingFunction === 'function')) {
    return list;
  }

  var result = [];

  for (var i = 0; i < list.length; i++) {
    result.push(mappingFunction(list[i]));
  }

  return result;
},

B.util.createIn = function(key, list) {
  return key + ' IN (' + util.map(list, esc).join(', ') + ')';
},

B.util.expand = function(list, key) {
  var result = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item[key]) {
      result[item[key]] = item;
    }
  }

  return result;
},

B.util.expandList = function(list, key) {
  var result = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var itemKey = item[key];

    if (itemKey) {
      if (result[itemKey]) {
        result[itemKey].push(item);
      } else {
        result[itemKey] = [item];
      }
    }
  }

  return result;
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
