//
// Copyright Platformers (C) 2019
//

var B = {};

B.VERSION = '1.0.0';

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// QUERY
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.query = {};

B.query.select = function (table, query, sort) {
  //
  // Convert an object query into a query string. Example:
  // { name: 'Nathan McCallum', company: 'Billow Software'}
  // Becomes:
  // 'name="Nathan McCallum" AND company="Billow Software"'
  //
  if (typeof query === 'object') {
    query = B.util.map(Object.keys(query), function (key, i) {
      var value = query[key];
      return key + '=' + esc(value);
    }).join(' AND ');
  }

  return Query.select(table, '*', query, sort);
};

B.query.selectOne = function (table, query, sort) {
  return B.query.select(table, query, sort)[0];
}

B.query.selectId = function (table, id) {
  return Query.selectId(table, id);
};

B.query.selectIn = function (table, field, list, sort) {
  var query = B.util.createIn(field, list);
  return B.query.select(table, query, sort);
};

//
// Get a list of the keys found in a table
//
B.query._getTableKeys = function (tableName) {
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
B.query._checkKeys = function (table, keys) {
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

B.query._checkTable = function (table) {
  return !!Cache.channels[Cache._makeLegacyTable(table)];
}

B.query.insert = function (table, values) {
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

B.query.update = function (table, id, values) {
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

B.QueryFactory.prototype.select = function (query, sort) {
  var items = B.query.select(this.table, query, sort);
  return new B.ResultSet(this.table, items, this.carrier, query, sort);
};

B.QueryFactory.prototype.selectOne = function (query, sort) {
  var item = B.query.select(this.table, query, sort)[0];

  if (item) {
    return new this.carrier(item);
  }
};

B.QueryFactory.prototype.selectId = function (id) {
  var item = B.query.selectId(this.table, id);

  if (item) {
    return new this.carrier(item);
  }
};

B.QueryFactory.prototype.selectIn = function () {
  //
B.QueryFactory.prototype.selectIn = function (field, list, sort) {
  var items = B.query.selectIn(this.table, field, list, sort);
  return new B.ResultSet(this.table, items, this.carrier, B.util.createIn(field, list), sort);
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

B.ResultSet.prototype.each = function (callback) {
  B.util.each(this.items, callback);
};

B.ResultSet.prototype.map = function (callback) {
  return B.util.map(this.items, callback);
};

B.ResultSet.prototype.toObject = function () {
  return this.map(function (queryItem) {
    return queryItem.toObject();
  });
};

B.ResultSet.prototype.toJSON = function () {
  return JSON.stringify(this.toObject());
};

B.defineQueryItemProperty = function (obj, key) {
  Object.defineProperty(obj, key, {
    get: function () {
      return this._item[key];
    },
    set: function (newValue) {
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

B.QueryItem.prototype.save = function () {
  console.log('Saving item to db', this._table, this._item);
};

B.QueryItem.prototype.get = function (key) { // TODO - error handling and stuff
  return this._item[key];
};

B.QueryItem.prototype.set = function (key, value) { // TODO - error handling
  this._item[key] = value;
};
//
// This function is called when an item is received.
//
B.QueryItem.prototype.onReceiveItem = function (item) {
  return item;
};

//
// This function is called when an item is saved.
//
B.QueryItem.prototype.onSaveItem = function (item) {
  return item;
};

B.QueryItem.prototype.toObject = function () {
  return this._item;
};

B.QueryItem.prototype.toJSON = function () {
  return JSON.stringify(this.toObject());
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// ORM INTERFACE
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//
// CONTACTS
//

B.Contact = function Contact(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.contacts';
};
B.Contact.prototype = Object.create(B.QueryItem.prototype);
B.Contact.prototype.constructor = B.QueryItem;

B.Company = function Company(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.companies';
};
B.Company.prototype = Object.create(B.QueryItem.prototype);
B.Company.prototype.constructor = B.QueryItem;

B.ContactGroup = function ContactGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.groups';
};
B.ContactGroup.prototype = Object.create(B.QueryItem.prototype);
B.ContactGroup.prototype.constructor = B.QueryItem;

B.ContactRegion = function ContactRegion(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.regions';
};
B.ContactRegion.prototype = Object.create(B.QueryItem.prototype);
B.ContactRegion.prototype.constructor = B.QueryItem;

B.ContactMailTemplate = function ContactMailTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Contacts.mailtemplates';
};
B.ContactMailTemplate.prototype = Object.create(B.QueryItem.prototype);
B.ContactMailTemplate.prototype.constructor = B.QueryItem;

//
// CUSTOM FIELDS
//

B.CustomField = function CustomField(item) {
  B.QueryItem.call(this, item);
  this._table = 'Notes.fields';
};
B.CustomField.prototype = Object.create(B.QueryItem.prototype);
B.CustomField.prototype.constructor = B.QueryItem;

//
// FORMS
//

B.Form = function Form(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.forms';
};
B.Form.prototype = Object.create(B.QueryItem.prototype);
B.Form.prototype.constructor = B.QueryItem;

B.Form.prototype.getValues = function () {
  return JSON.parse(this.value || '{}');
};

B.Form.prototype.setValues = function (newValues) {
  this.value = JSON.stringify(newValues);
};

B.Form.prototype.getValue = function (ref) {
  var vals = this.getValues();
  return vals[ref];
};

B.Form.prototype.setValue = function (ref) {
  var vals = this.getValues();
  vals[ref] = ref;
  this.setValues(vals);
};

B.Form.prototype.getSubforms = function (field) {
  return B.Forms.select({ linkedid: this.id + ':' + field }, 'date DESC');
};

B.FormTemplate = function FormTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.templates';
};
B.FormTemplate.prototype = Object.create(B.QueryItem.prototype);
B.FormTemplate.prototype.constructor = B.QueryItem;

B.FormField = function FormField(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.fields';
};
B.FormField.prototype = Object.create(B.QueryItem.prototype);
B.FormField.prototype.constructor = B.QueryItem;

B.FormGroup = function FormGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.groups';
};
B.FormGroup.prototype = Object.create(B.QueryItem.prototype);
B.FormGroup.prototype.constructor = B.QueryItem;

B.FormState = function FormState(item) {
  B.QueryItem.call(this, item);
  this._table = 'Forms.states';
};
B.FormState.prototype = Object.create(B.QueryItem.prototype);
B.FormState.prototype.constructor = B.QueryItem;

//
// JOBS
//

B.Job = function Job(item) {
  B.QueryItem.call(this, item);
  this._table = 'Jobs.jobs';
};
B.Job.prototype = Object.create(B.QueryItem.prototype);
B.Job.prototype.constructor = B.QueryItem;

B.JobGroup = function JobGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Jobs.groups';
};
B.JobGroup.prototype = Object.create(B.QueryItem.prototype);
B.JobGroup.prototype.constructor = B.QueryItem;

B.JobProduct = function JobGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Jobs.jobproducts';
};
B.JobProduct.prototype = Object.create(B.QueryItem.prototype);
B.JobProduct.prototype.constructor = B.QueryItem;

//
// PROJECTS
//

B.Project = function Project(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.projects';
};
B.Project.prototype = Object.create(B.QueryItem.prototype);
B.Project.prototype.constructor = B.QueryItem;

B.ProjectAssetGroup = function ProjectAssetGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.assetgroups';
};
B.ProjectAssetGroup.prototype = Object.create(B.QueryItem.prototype);
B.ProjectAssetGroup.prototype.constructor = B.QueryItem;

B.ProjectGroup = function ProjectGroup(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.groups';
};
B.ProjectGroup.prototype = Object.create(B.QueryItem.prototype);
B.ProjectGroup.prototype.constructor = B.QueryItem;

B.ProjectMilestone = function ProjectMilestone(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.milestones';
};
B.ProjectMilestone.prototype = Object.create(B.QueryItem.prototype);
B.ProjectMilestone.prototype.constructor = B.QueryItem;

B.ProjectMilestoneTemplate = function ProjectMilestoneTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.milestonetemplates';
};
B.ProjectMilestoneTemplate.prototype = Object.create(B.QueryItem.prototype);
B.ProjectMilestoneTemplate.prototype.constructor = B.QueryItem;

B.ProjectActivity = function ProjectActivity(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.projectactivities';
};
B.ProjectActivity.prototype = Object.create(B.QueryItem.prototype);
B.ProjectActivity.prototype.constructor = B.QueryItem;

B.ProjectProduct = function ProjectProduct(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.projectproducts';
};
B.ProjectProduct.prototype = Object.create(B.QueryItem.prototype);
B.ProjectProduct.prototype.constructor = B.QueryItem;

B.ProjectTemplate = function ProjectTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.projectemplates';
};
B.ProjectTemplate.prototype = Object.create(B.QueryItem.prototype);
B.ProjectTemplate.prototype.constructor = B.QueryItem;

B.ProjectStage = function ProjectStage(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.stages';
};
B.ProjectStage.prototype = Object.create(B.QueryItem.prototype);
B.ProjectStage.prototype.constructor = B.QueryItem;

B.ProjectTaskTemplate = function ProjectTaskTemplate(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.tasktemplates';
};
B.ProjectTaskTemplate.prototype = Object.create(B.QueryItem.prototype);
B.ProjectTaskTemplate.prototype.constructor = B.QueryItem;

B.ProjectAsset = function ProjectAsset(item) {
  B.QueryItem.call(this, item);
  this._table = 'Projects.assets';
};
B.ProjectAsset.prototype = Object.create(B.QueryItem.prototype);
B.ProjectAsset.prototype.constructor = B.QueryItem;

//
// SALES
//

B.Quote = function Quote(item) {
  B.QueryItem.call(this, item);
  this._table = 'Sales.quotes';
};
B.Quote.prototype = Object.create(B.QueryItem.prototype);
B.Quote.prototype.constructor = B.QueryItem;

B.Quote.prototype.getProducts = function () {
  return B.QuoteProducts.select({
    quoteid: this.id,
  });
};

B.CatalogProduct = function CatalogProduct(item) {
  B.QueryItem.call(this, item);
  this._table = 'Sales.products';
};
B.CatalogProduct.prototype = Object.create(B.QueryItem.prototype);
B.CatalogProduct.prototype.constructor = B.QueryItem;

B.CatalogProduct.prototype.getCustom = function (ref) {
  var custom = JSON.parse(this.custom || '{}');
  return custom[ref];
};

B.CatalogProduct.prototype.setCustom = function (ref, value) {
  var custom = JSON.parse(this.custom || '{}');
  custom[ref] = value;
  this.custom = JSON.stringify(custom);
};

B.QuoteProduct = function QuoteProduct(item) {
  B.QueryItem.call(this, item);
  this._table = 'Sales.quoteproducts';
};
B.QuoteProduct.prototype = Object.create(B.QueryItem.prototype);
B.QuoteProduct.prototype.constructor = B.QueryItem;

B.QuoteProduct.prototype.getCustom = function (ref) {
  var custom = JSON.parse(this.custom || '{}');
  return custom[ref];
};

B.QuoteProduct.prototype.setCustom = function (ref, value) {
  var custom = JSON.parse(this.custom || '{}');
  custom[ref] = value;
  this.custom = JSON.stringify(custom);
};

B.QuoteProduct.prototype.getCatalogProduct = function () {
  return B.CatalogProducts.selectId(this.productid);
};

//
// QUERY FACTORY
//

B.CatalogProducts = new B.QueryFactory('Sales.products', B.CatalogProduct);
B.Companies = new B.QueryFactory('Contacts.companies', B.Company);
B.ContactGroups = new B.QueryFactory('Contacts.groups', B.ContactGroup);
B.ContactMailTemplates = new B.QueryFactory('Contacts.mailtemplates', B.ContactMailTemplate);
B.ContactRegions = new B.QueryFactory('Contacts.regions', B.ContactRegion);
B.Contacts = new B.QueryFactory('Contacts.Contacts', B.Contact);
B.CustomFields = new B.QueryFactory('Notes.fields', B.CustomField);
B.FormFields = new B.QueryFactory('Forms.fields', B.FormField);
B.FormGroups = new B.QueryFactory('Forms.groups', B.FormGroup);
B.Forms = new B.QueryFactory('Forms.forms', B.Form);
B.FormStates = new B.QueryFactory('Forms.state', B.FormState);
B.FormTemplates = new B.QueryFactory('Forms.templates', B.FormTemplate);
B.JobGroups = new B.QueryFactory('Jobs.groups', B.JobGroup);
B.JobProducts = new B.QueryFactory('Jobs.jobproducts', B.JobProduct);
B.Jobs = new B.QueryFactory('Jobs.jobs', B.Job);
B.ProjectActivities = new B.QueryFactory('Projects.projectactivities', B.ProjectActivity);
B.ProjectAssetGroups = new B.QueryFactory('Projects.assetgroups', B.ProjectAssetGroup);
B.ProjectAssets = new B.QueryFactory('Projects.assets', B.ProjectAsset);
B.ProjectGroups = new B.QueryFactory('Projects.groups', B.ProjectGroup);
B.ProjectMilestones = new B.QueryFactory('Projects.milestones', B.ProjectMilestone);
B.ProjectMilestoneTemplates = new B.QueryFactory('Projects.milestonetemplates', B.ProjectMilestoneTemplate);
B.ProjectProducts = new B.QueryFactory('Projects.projectproducts', B.ProjectProduct);
B.Projects = new B.QueryFactory('Projects.projects', B.Project);
B.ProjectStages = new B.QueryFactory('Projects.stages', B.ProjectStage);
B.ProjectTaskTemplates = new B.QueryFactory('Projects.tasktemplates', B.ProjectTaskTemplate);
B.ProjectTemplates = new B.QueryFactory('Projects.templates', B.ProjectTemplate);
B.QuoteProducts = new B.QueryFactory('Sales.quoteproducts', B.QuoteProduct);
B.Quotes = new B.QueryFactory('Sales.quotes', B.Quote);

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

B.date.getTimeInDay = function (time) {
  var d = new Date(time);
  return d.getTime() % B.date.DAY;
};

B.date.now = function () {
  return (new Date()).getTime();
};

B.date.today = function () {
  var now = new Date();
  var d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return d.getTime();
};

//
// Converts a date to a string more appropriate for display to the user (14 Jul 2017)
//
B.date.commonDateString = function (date) {
  var dateString = "";
  var tempDate = date;

  if (!(date instanceof Date)) {
    tempDate = new Date(parseInt(date));
  }

  dateString = tempDate.toString().split(" ");
  dateString = dateString[2] + " " + dateString[1] + " " + dateString[3];

  return dateString;
};

B.date.dayOfWeek = function () {
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TYPE CASTING UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.int = function (item) {
  return parseInt(B.num(item));
};

B.float = function (item) {
  return parseFloat(B.num(item));
};

B.num = function (item) {
  var num = Number(item);

  if (isNaN(num)) {
    return 0;
  } else {
    return num;
  }
};

B.str = function (item) {
  if (item == undefined || typeof item === 'function' || typeof item === 'object') {
    return '';
  }

  var str = String(item);

  if (str === 'NaN') {
    return '';
  } else {
    return str;
  }
};

B.arr = function (item) {
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// STRING UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.string = {};

B.string.padStart = function (item, num) {
  var str = B.str(item);
  while (str.length < num) {
    str = '0' + str;
  }
  return str;
};

B.string.padEnd = function (item, num) {
  var str = B.str(item);
  while (str.length < num) {
    str = str + '0';
  }
  return str;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// NUMBER UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.number = {};

B.number.round0 = function (num) {
  return B.num(num).toFixed(0);
};

B.number.round1 = function (num) {
  return B.num(num).toFixed(1);
};

B.number.round2 = function (num) {
  return B.num(num).toFixed(2);
};

B.number.commify = function (num) {
  var parts = B.str(num).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

B.number.commify0 = function (num) {
  return B.number.commify(B.number.round0(num));
};

B.number.commify1 = function (num) {
  return B.number.commify(B.number.round1(num));
};

B.number.commify2 = function (num) {
  return B.number.commify(B.number.round2(num));
};

//
// Convert a float to a string (with a dollar sign, comma separated)
//
B.number.currency = function (number) {
  return '$' + B.number.commify2(number);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// FORMAT
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.format = {};

B.format.commonDateString = B.date.commonDateString;
B.format.currency = B.number.currency;
B.format.padStart = B.string.padStart;
B.format.padEnd = B.string.padEnd;

B.format.shortDate = function (ms) {
  var date = B.util.ensureDateObj(ms);
  var year = date.getFullYear();
  var month = B.string.padStart(date.getMonth() + 1, 2);
  var day = B.string.padStart(date.getDate(), 2);
  return day + '/' + month + '/' + year;
};

B.format.shortTime = function (ms) {
  var d = B.util.ensureDateObj(ms);
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var ext = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  minutes = B.string.padStart(minutes, 2);
  return hours + ':' + minutes + ext;
};

B.format.shortDateTime = function (ms) {
  return B.format.shortTime(ms) + ' ' + B.format.shortDate(ms);
};

B.format.commonDateTime = function (ms) {
  return B.format.shortTime(ms) + ' ' + B.format.commonDateString(ms);
};

B.format.date = function () { // TODO - copy result from Upvise
};

B.format.dateTime = function () { // TODO - copy result from Upvise
};

B.format.capitalise = function (item) {
  var str = B.str(item);

  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } else {
    return '';
  }
};

B.format.title = function (item) {
  var list = B.str(item).split(' ');
  return B.util.map(list, B.format.capitalise).join(' ');
};

B.format.distance = function (metres) {
  metres = B.int(metres);
  if (metres < 1000) {
    return metres + 'm';
  } else {
    return B.number.commify1(metres / 1000) + 'km';
  }
};

B.format.multiValue = function (item) {
  return B.str(item).replace(/\|/g, ', ');
};

B.format.upviseLink = function (table, id) {
  if (table == "" || id == "" || id == null)
    return "";
  if (table == "Forms.forms") {
    id = id.split(":")[0];
  }
  var item = Query.selectId(table, id);
  if (item == null)
    return "";
  var func = "";
  if (table == "Assets.assets")
    func = "Assets.viewAsset";
  else if (table == "Assets.locations")
    func = "Assets.viewSite";
  else if (table == "Projects.projects")
    func = "Projects.viewProject";
  else if (table == "System.files")
    func = "Files.viewFile";
  else if (table == "Qhse.procedures")
    func = "Qhse.viewArticle";
  else if (table == "Sales.products")
    func = "Sales.viewProduct";
  else if (table == "Sales.opportunities")
    func = "Sales.viewOpp";
  else if (table == "Sales.quotes")
    func = "Sales.viewQuote";
  else if (table == "Jobs.jobs")
    func = "Jobs.viewJob";
  else if (table == "Forms.forms")
    func = "Forms.viewForm";
  else if (table == "Contacts.contacts")
    func = "Contacts.viewContact";
  else if (table == "Contacts.companies")
    func = "Contacts.viewCompany";
  else if (table == "Calendar.events")
    func = "Calendar.viewEvent";
  else if (table == "Tasks.tasks")
    func = "Tasks.viewTask";
  else if (table == "Tasks.lists")
    func = "Tasks.viewTaskList";
  else if (table == "Time.slots")
    func = "Time.viewSlot";
  else if (table == "Tools.tools")
    func = "Tools.viewTool";
  var name = item.name;
  if (table == "Forms.forms") {
    name = Query.names("Forms.templates", item.templateid) + " " + item.name;
  }
  func = _func(func, id);
  var onclick = "event.cancelBubble=true;" + _func("Engine.eval", func);
  return '<a class=link onclick="' + onclick + '">' + name + '</a>';
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// UTIL
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.util = {};

B.util.ensureDateObj = function (date) {
  if (!(date instanceof Date)) {
    return new Date(B.int(date));
  }
  return date;
};

//
// Creates a string of a function with paramaters
//
B.util.func = function (functionName, paramaters) {
  return functionName + '(' + paramaters.join(',') + ')';
};

//
// Create an Engine.eval() string with paramaters
//
B.util.engineCall = function (functionName, paramaters) {
  return util._func('Engine.eval', [B.util.esc(util._func(functionName, paramaters))]);
};

//
// Creates an array of specified attributes in an array of objects.
//
B.util.pluck = function (arrayOfObjects, key) {
  var result = [];

  for (var i = 0; i < arrayOfObjects.length; i++) {
    var item = arrayOfObjects[i];
    if (item && item[key]) {
      result.push(item[key]);
    }
  }

  return result;
};

B.util.each = function (list, callback) {
  for (var i = 0; i < list.length; i++) {
    callback(list[i]);
  }
};

//
// Maps over a collection and applies the transformation function. Returns a new array.
//
B.util.map = function (list, mappingFunction) {
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

B.util.mapArray = function (list, mappingFunction) {
  var result = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    result.push(mappingFunction(item, i));
  }

  return result;
};

B.util.mapObject = function (list, mappingFunction) {
  var keys = Object.keys(list);
  var result = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = list[i];

    result[key] = mappingFunction(value, key, i);
  }

  return result;
};

B.util.createIn = function (key, list) {
  return key + ' IN (' + B.util.map(list, B.util.esc).join(', ') + ')';
};

B.util.expand = function (list, key) {
  var result = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item[key]) {
      result[item[key]] = item;
    }
  }

  return result;
};

B.util.expandList = function (list, key) {
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

B.util.esc = function (str) {
  return B.util._quotation(B.str(str), "'", "'");
};

B.util._quotation = function (value, open, close) {
  open = open || "'";
  close = close || open;

  if (typeof value === 'string') {
    return open + value + close;
  } else {
    return value;
  }
};

B.util.isEmpty = function (obj) {
  if (Array.isArray(obj)) {
    return !!obj.length;
  } else {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}

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

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

try {
  Report.writeDashboard = function () {
    console.log('BILLOW.js successfully loaded');
    console.log(B.Forms.select({ id: '1B1A76664AA2701E6B4CB87B905373' }));
    console.log(B.FormTemplates.select());
    console.log(B.Contacts.select());
    console.log(B.Companies.select());
  };
} catch (err) {
  //
}
