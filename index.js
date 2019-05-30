//
// Copyright Platformers (C) 2019
//

var B = {};

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
// QUERY
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.query = {};

B.query.select = function(table, query, sort) {
  //
  // Convert an object query into a query string. Example:
  // { name: 'Nathan McCallum', company: 'Billow Software'}
  // Becomes:
  // 'name="Nathan McCallum" AND company="Billow Software"'
  //
  if (typeof query === 'object') {
    query = B.util.map(Object.keys(query), function(key, i) {
      var value = query[key];
      return key + '=' + esc(value);
    }).join(' AND ');
  }

  return Query.select(table, '*', query, sort);
};

B.query.selectOne = function(table, query, sort) {
  return B.query.select(table, query, sort)[0];
}

B.query.selectId = function(table, id) {
  return Query.selectId(table, id);
};

B.query.selectIn = function(table, field, list, sort) {
  var query = B.util.createIn(field, list);
  return B.query.select(table, query, sort);
};

//
// Get a list of the keys found in a table
//
B.query._getTableKeys = function(tableName) {
  var tableId = Cache._makeLegacyTable(tableName);
  var channel = Cache.channels[tableId];

  if (channel) {
    return Object.keys(channel.columns);
  } else {
    console.error('Cannot find table schema for given table name:', tableName);
    return [];
  }
};

//
// Return an error if any of the given keys are not defined in the db schema
//
B.query._checkKeys = function(table, keys) {
  var tableKeys = B.query._getTableKeys(table);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!tableKeys.includes(key)) {
      console.error(table + ' does not include the key "' + key + '"');
      return false;
    }
  }

  return true;
};

B.query._checkTable = function(table) {
  return !!Cache.channels[Cache._makeLegacyTable(table)];
}

B.query.insert = function(table, values) {
  var validTable = B.query._checkTable(table);

  if (!validTable) {
    console.error('Table "' + table + '" does not exist');
    return;
  }

  var validKeys = B.query._checkKeys(table, Object.keys(values));

  if (!validKeys) {
    return;
  }

  return Query.insert(table, values);
};

B.query.update = function(table, id, values) {
  var validTable = B.query._checkTable(table);

  if (!validTable) {
    console.error('Table "' + table + '" does not exist');
    return;
  }

  var validKeys = B.query._checkKeys(table, Object.keys(values));

  if (!validKeys) {
    return;
  }

  return Query.update(table, values, 'id=' + esc(id));
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// QUERY FACTORY
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.QueryFactory = function QueryFactory(table, carrier) {
  this.table = table;
  this.carrier = carrier;
};

B.QueryFactory.prototype.select = function(query, sort) {
  var items = B.query.select(this.table, query, sort);
  return new B.ResultSet(this.table, items, this.carrier, query, sort);
};

B.QueryFactory.prototype.selectId = function() {
  //
};

B.QueryFactory.prototype.selectIn = function() {
  //
};

B.ResultSet = function ResultSet(table, items, Carrier, query, sort) {
  this.table = table;
  this.query = query || '';
  this.sort = sort || '';
  this.items = [];

  for (var i = 0; i < items.length; i++) {
    this.items.push(new Carrier(items[i]));
  }
};

B.defineQueryItemProperty = function(obj, key) {
  Object.defineProperty(obj, key, {
    get: function() {
      return this._item[key];
    },
    set: function(newValue) {
      this._item[key] = newValue;
      return newValue;
    }
  });
}

B.QueryItem = function QueryItem(item) {
  this._table = '';
  this._item = item;

  var keys = Object.keys(item);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    this[key] = item[key];
    B.defineQueryItemProperty(this, key);
  }
};

B.QueryItem.prototype.save = function() {
  console.log('Saving item to db', this._table, this._item);
};

//
// This function is called when an item is received.
//
B.QueryItem.prototype.onReceiveItem = function(item) {
  return item;
};

//
// This function is called when an item is saved.
//
B.QueryItem.prototype.onSaveItem = function(item) {
  return item;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// ORM INTERFACE
//
////////////////////////////////////////////////////////////////////////////////////////////////////


B.Form = function Form(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.forms';
};
B.Form.prototype = Object.create(B.QueryItem.prototype);
B.Form.prototype.constructor = B.QueryItem;
B.Forms = new B.QueryFactory('Forms.forms', B.Form);

B.FormTemplate = function FormTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.templates';
};
B.FormTemplate.prototype = Object.create(B.QueryItem.prototype);
B.FormTemplate.prototype.constructor = B.QueryItem;
B.FormTemplates = new B.QueryFactory('Forms.templates', B.FormTemplate);

B.Contact = function Contact(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.contacts';
};
B.Contact.prototype = Object.create(B.QueryItem.prototype);
B.Contact.prototype.constructor = B.QueryItem;
B.Contacts = new B.QueryFactory('Contacts.Contacts', B.Contact);

B.Company = function Company(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.companies';
};
B.Company.prototype = Object.create(B.QueryItem.prototype);
B.Company.prototype.constructor = B.QueryItem;
B.Companies = new B.QueryFactory('Contacts.companies', B.Company);

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
};

//
// Creates a string of a function with paramaters
//
B.util.func = function(functionName, paramaters) {
  return functionName + '(' + paramaters.join(',') + ')';
};

//
// Create an Engine.eval() string with paramaters
//
B.util.engineCall = function(functionName, paramaters) {
  return util._func('Engine.eval', [esc(util._func(functionName, paramaters))]);
};

//
// Converts a number into a string with 2 decimal places
//
B.util._num = function(number) {
  if (!number) {
    return '0.00';
  }

  return parseFloat(number).toFixed(2);
};

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
};

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
};

//
// Maps over a collection and applies the transformation function. Returns a new array.
//
B.util.map = function(list, mappingFunction) {
  if (typeof mappingFunction !== 'function') {
    console.error('No mapping function provided to B.util.map()');
    return list;
  }

  if (Array.isArray(list)) {
    return B.util.mapArray(list, mappingFunction);
  } else {
    return B.util.mapObject(list, mappingFunction);
  }
};

B.util.mapArray = function(list, mappingFunction) {
  var result = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    result.push(mappingFunction(item, i));
  }

  return result;
};

B.util.mapObject = function(list, mappingFunction) {
  var keys = Object.keys(list);
  var result = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = list[i];

    result[key] = mappingFunction(value, key, i);
  }

  return result;
};

B.util.createIn = function(key, list) {
  return key + ' IN (' + B.util.map(list, esc).join(', ') + ')';
};

B.util.expand = function(list, key) {
  var result = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item[key]) {
      result[item[key]] = item;
    }
  }

  return result;
};

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
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Magically export BILLOW.js to the right places
//
////////////////////////////////////////////////////////////////////////////////////////////////////
try {
  module.exports = B;
} catch (err) {
  //
}

try {
  window.B = B;
} catch (err) {
  //
}

Report.writeDashboard = function() {
  console.log('BILLOW.js successfully loaded');
  console.log(B.Forms.select({id: '1B1A76664AA2701E6B4CB87B905373'}));
  console.log(B.FormTemplates.select());
  console.log(B.Contacts.select());
  console.log(B.Companies.select());
};
