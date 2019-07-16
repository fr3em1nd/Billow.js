//
// Copyright Platformers (C) 2019
//

var B = {};

B.VERSION = '1.6.2';

const x = (methodName) => {
  //
  // TODO - is it possible to make this into anything more intersting/useful?
  //
  throw new Error('Missing required paramater: ' + methodName);
};

B.isUpviseWeb = () => {
  return typeof WEB === 'function' ? WEB() : false;
};

B.isUpviseMobile = () => {
  return typeof WEB === 'function' ? !WEB() : false;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// LOGGER
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.logger = {
  error(...message) {
    B.isUpviseWeb() && console.error(...message);
  },

  warn(...message) {
    B.isUpviseWeb() && console.warn(...message);
  },

  log(...message) {
    B.isUpviseWeb() && console.log(...message);
  },

  info(...message) {
    B.isUpviseWeb() && console.info(...message);
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// QUERY
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.query = {
  select(table = x`table`, query = '', sort = '') {
    const validTable = B.query._checkTable(table);

    if (!validTable) {
      B.logger.error('Table "' + table + '" does not exist');
      return [];
    }

    //
    // Convert an object query into a query string. Example:
    // { name: 'Nathan McCallum', company: 'Billow Software'}
    // Becomes:
    // 'name="Nathan McCallum" AND company="Billow Software"'
    //
    if (typeof query === 'object') {
      const keys = Object.keys(query);

      //
      // Use this to check that the keys are valid. Note: I have chosen to not return here. My reasoning
      // is that even if a query is faulty, it should still be left to return whatever it will return.
      // I see this as a safer/more predictable way of handling things than if we returned nothing.
      //
      B.query._checkKeys(table, keys);

      query = B.util.map(keys, (key) => {
        const value = query[key];
        return `${key}=${esc(value)}`;
      }).join(' AND ');
    }

    return Query.select(table, '*', query, sort);
  },

  selectOne(table = x`table`, query = '', sort = '') {
    return B.query.select(table, query, sort)[0];
  },

  selectId(table = x`table`, id = x`id`) {
    const validTable = B.query._checkTable(table);

    if (!validTable) {
      B.logger.error('Table "' + table + '" does not exist');
      return [];
    }

    const res = Query.selectId(table, id || '');

    //
    // Thierry's selectId returns null instead of undefined, causing other bugs
    // We need to stop the madness
    //
    if (B.util.isEmpty(res)) {
      return undefined;
    }

    return res;
  },

  selectIn(table = x`table`, field = x`field`, list = x`list`, sort = '') {
    const query = B.util.createIn(field, list);
    return B.query.select(table, query, sort);
  },

  //
  // Get a list of the keys found in a table
  //
  _getTableKeys(tableName = x`tableName`) {
    const tableId = Cache._makeLegacyTable(tableName);
    const channel = Cache.channels[tableId];

    if (channel) {
      return Object.keys(channel.columns);
    } else {
      B.logger.error('Cannot find table schema for given table name:', tableName);
      return [];
    }
  },

  //
  // Return an error if any of the given keys are not defined in the db schema
  //
  _checkKeys(table = x`table`, keys = x`keys`) {
    if (!B.isUpviseWeb()) {
      return true;
    }

    const tableKeys = B.query._getTableKeys(table);

    for (const key of keys) {
      if (!tableKeys.includes(key)) {
        B.logger.error(table + ' does not include the key "' + key + '"');
        return false;
      }
    }

    return true;
  },

  _checkTable(table = x`table`) {
    return B.isUpviseWeb() ? !!Cache.channels[Cache._makeLegacyTable(table)] : true;
  },

  insert(table = x`table`, values = x`values`) {
    const validTable = B.query._checkTable(table);

    if (!validTable) {
      B.logger.error('Table "' + table + '" does not exist');
      return;
    }

    const validKeys = B.query._checkKeys(table, Object.keys(values));

    if (!validKeys) {
      return;
    }

    return Query.insert(table, values);
  },

  update(table = x`table`, id = x`id`, values = x`values`) {
    const validTable = B.query._checkTable(table);

    if (!validTable) {
      B.logger.error('Table "' + table + '" does not exist');
      return;
    }

    const validKeys = B.query._checkKeys(table, Object.keys(values));

    if (!validKeys) {
      return;
    }

    return Query.update(table, values, 'id=' + esc(id));
  },

  _getName(item = {name: ''}) {
    return item.name || item.productname;
  },

  names(table = x`table`, id = x`id`) {
    const item = B.query.selectId(table, id);
    return B.query._getName(item);
  },

  options(table = x`table`, query = '', sort = 'name') {
    const items = B.query.select(table, query, sort);
    let buffer = [':None'];

    for (const item of items) {
      const id = table.toLowerCase() === 'system.users' ? item.name : item.id;
      const name = B.query._getName(item);
      buffer.push(`${id}:${name}`);
    }

    return buffer.join('|');
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RESULT SET
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.ResultSet = class ResultSet {
  constructor(table = x`table`, items = x`items`, Carrier = x`Carrier`, query = '', sort = '') {
    this.table = table;
    this.query = query;
    this.sort = sort;
    this.items = [];

    for (const item of items) {
      this.items.push(new Carrier(item));
    }
  }

  count() {
    return this.items.length;
  }

  each(callback = x`callback`) {
    B.util.each(this.items, callback);
  }

  map(callback = x`callback`) {
    return B.util.map(this.items, callback);
  }

  pluck(key = x`key`) {
    let list = [];

    this.each((item) => {
      if (item.get(key)) {
        list.push(item.get(key));
      } else {
        B.logger.warn('Given key "' + key + '" does not exist in the object');
      }
    });

    return list;
  }

  keyBy(key = x`key`) {
    let result = {};

    this.each((item) => {
      const k = item.get(key);

      if (k) {
        result[k] = item;
      } else {
        B.logger.warn('Given key "' + key + '" does not exist in the object');
      }
    });

    return result;
  }

  pairBy(keyKey = x`keyKey`, valueKey = x`valueKey`) {
    let result = {};

    this.each((item) => {
      const k = item.get(keyKey);
      const v = item.get(valueKey);

      if (k && v) {
        result[k] = v;
      }
    });

    return result;
  }

  listBy(key = x`key`) {
    let result = {};

    this.each((item) => {
      const k = item.get(key);

      if (!k) {
        B.logger.warn('Given key "' + key + '" does not exist in the object');
        return;
      }

      if (result[k]) {
        result[k].push(item);
      } else {
        result[k] = [item];
      }
    });

    return result;
  }

  isEmpty() {
    return !!B.util.isEmpty(this.items);
  }

  toObject() {
    return this.map((queryItem) => queryItem.toObject());
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// QUERY ITEM
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.QueryItem = class QueryItem {
  constructor(item = x`item`) {
    this._table = ''; // Subclasses should override this!
    this._item = item;
    this._keys = Object.keys(item);
  }

  save() {
    B.logger.log('Saving item: ', this._table, this._item);
    var item = B.util.quickClone(this._item);

    if (item.id) {
      var id = item.id;
      delete item.id;
      B.query.update(this._table, id, item);
    } else {
      var id = B.query.insert(this._table, item);
      this.set('id', id);
      return id;
    }
  }

  get(key = x`key`, runOnGetHandler = true) {
    if (key.includes('.')) {
      var splitted = key.split('.');
      var a = splitted[0];
      var b = splitted[1];

      if (a === 'value' || a === 'custom') {
        var obj = JSON.parse(this._item[a] || '{}');
        return obj[b];
      } else {
        return B.logger.error('.get() dot notation can only be used to access `value` and `custom`');
      }
    }

    if (!this._keys.includes(key)) {
      return B.logger.error('Item of schema ' + this._table + ' does not include key: ' + key);
    }

    //
    // Run the relevant onGet() function
    //
    if (typeof this['onGet_' + key] === 'function' && !!runOnGetHandler) {
      const func = this['onGet_' + key];
      return func.call(this, this._item[key]);
    }

    return this._item[key];
  }

  get_raw(key = x`key`) {
    return this.get(key, false);
  }

  set(key = x`key`, value = x`value`) {
    if (key.includes('.')) {
      var splitted = key.split('.');
      var a = splitted[0];
      var b = splitted[1];

      if (a === 'value' || a === 'custom') {
        var obj = JSON.parse(this._item[a] || '{}');
        obj[b] = value;
        this._item[a] = JSON.stringify(obj);
        return;
      } else {
        return B.logger.error('.set() dot notation can only be used to access `value` and `custom`');
      }
    }

    if (!this._keys.includes(key)) {
      return B.logger.error('Item of schema "' + this._table + '" does not include key: ' + key);
    }

    this._item[key] = value;
  }

  get_id2name(key = x`key`, table = x`table`) {
    //
    // TODO - Query.name is broken in cases where the table's name value is not called "name".
    // (For example Sales.quoteproduts, where the name field is "productname"
    //
    return Query.names(table, this.get(key)) || '';
  }

  get_int(key = x`key`) {
    return B.int(this.get(key));
  }

  get_float(key = x`key`) {
    return B.float(this.get(key));
  }

  get_num(key = x`key`) {
    return B.num(this.get(key));
  }

  get_str(key = x`key`) {
    return B.str(this.get(key));
  }

  get_currency(key = x`key`) {
    return B.format.currency(this.get(key));
  }

  get_commonDateTime(key = x`key`) {
    return B.format.commonDateTime(this.get(key));
  }

  get_commonDate(key = x`key`) {
    return B.format.commonDateString(this.get(key));
  }

  get_shortDate(key = x`key`) {
    return B.format.shortDate(this.get(key));
  }

  get_shortTime(key = x`key`) {
    return B.format.shortTime(this.get(key));
  }

  get_shortDateTime(key = x`key`) {
    return B.format.shortDateTime(this.get(key));
  }

  get_date(key = x`key`) {
    return B.format.date(this.get(key));
  }

  get_dateTime(key = x`key`) {
    return B.format.dateTime(this.get(key));
  }

  get_capitalise(key = x`key`) {
    return B.format.capitalise(this.get(key));
  }

  get_title(key = x`key`) {
    return B.format.title(this.get(key));
  }

  get_multiValue(key = x`key`) {
    return B.format.multiValue(this.get(key));
  }

  getUpviseLink(altName = '') {
    return B.format.upviseLink(this._table, this.get('id'), altName);
  }

  getCustoms() {
    const cs = this.get('custom');
    return cs ? JSON.parse(cs) : {};
  }

  setCustoms(newCustoms = x`newCustoms`) {
    this.set('custom', JSON.string(newCustoms));
  }

  getCustom(ref = x`ref`) {
    const customs = this.getCustoms();
    return customs[ref];
  }

  setCustom(ref = x`ref`, value = x`value`) {
    let customs = this.getCustoms();
    customs[ref] = value;
    this.setCustoms(customs);
  }

  getValues() {
    return JSON.parse(this.get('value') || '{}');
  }

  setValues(newValues = x`newValues`) {
    this.set('value', JSON.stringify(newValues));
  }

  getValue(ref = x`ref`) {
    var values = this.getValues();
    return values[ref];
  }

  setValue(ref = x`ref`, value = x`value`) {
    var values = this.getValues();
    values[ref] = value;
    this.setValues(values);
  }

  getLinkedJobs() {
    let linkedAttr = '';

    switch (this._table) {
      case 'Projects.projects': {
        linkedAttr = 'projectid';
        break;
      } case 'Assets.sites': {
        linkedAttr = 'siteid';
        break;
      } case 'Sales.quotes': {
        const status = this.get_int('status');
        if (status === 1) { // invoice
          linkedAttr = 'invoiceid';
        } else if (status === 0) { // quote
          linkedAttr = 'quoteid';
        }
        break;
      } case 'Contacts.company': {
        linkedAttr = 'companyid';
        break;
      } case 'Contacts.contacts': {
        linkedAttr = 'contactid';
        break;
      } case 'Tools.tools': {
        linkedAttr = 'toolid';
        break;
      } case 'Jobs.groups': {
        linkedAttr = 'groupid';
      }
    }

    if (!linkedAttr) {
      B.logger.error('getLinkedJobs() does not support the table ' + this._table);
      return [];
    }

    return B.Jobs.select({
      [linkedAttr]: this.get('id'),
    });
  }

  getLinkedForms() {B.logger.error('Not implemented - sorry!')}
  getLinkedProjects() {B.logger.error('Not implemented - sorry!')}
  getLinkedQuotes() {B.logger.error('Not implemented - sorry!')}
  getLinkedDeals() {B.logger.error('Not implemented - sorry!')}
  getLinkedContacts() {B.logger.error('Not implemented - sorry!')}
  getLinkedCompanies() {B.logger.error('Not implemented - sorry!')}
  getLinkedEvents() {B.logger.error('Not implemented - sorry!')}
  getLinkedEquipment() {B.logger.error('Not implemented - sorry!')}
  getLinkedFiles() {B.logger.error('Not implemented - sorry!')}
  getLinkedTasks() {B.logger.error('Not implemented - sorry!')}
  getLinkedNotes() {B.logger.error('Not implemented - sorry!')}
  getLinkedProducts() {B.logger.error('Not implemented - sorry!')}
  getLinkedServices() {B.logger.error('Not implemented - sorry!')}
  getLinkedAssets() {B.logger.error('Not implemented - sorry!')}
  getLinkedPunchItems() {B.logger.error('Not implemented - sorry!')}
  getLinkedTimeEntries() {B.logger.error('Not implemented - sorry!')}

  toObject() {
    return B.util.quickClone(this._item);
  }

  toJSON() {
    return JSON.stringify(this._item);
  }

  //
  // OVERIDES
  //
  onReceiveItem(item) {
    return item;
  }

  onSaveItem(item) {
    return item;
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// ORM INTERFACE
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//
// CONTACTS
//

B.Contact = class Contact extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Contacts.contacts';
  }
};

B.Company = class Company extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Contacts.companies';
  }
};

B.ContactGroup = class ContactGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Contacts.groups';
  }
};

B.ContactRegion = class ContactRegion extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Contacts.regions';
  }
};

B.ContactMailTemplate = class ContactMailTemplate extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Contacts.mailtemplates';
  }
};

//
// CUSTOM FIELDS
//

B.CustomField = class CustomField extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Notes.fields';
  }
};

//
// FORMS
//

B.Form = class Form extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Forms.forms';
  }

  getSubforms(field = x`field`) {
    return B.Forms.select(
      {
        linkedid: this.get('id') + ':' + field
      },
      'date DESC'
    );
  }
};

B.FormTemplate = class FormTemplate extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Forms.templates';
  }
};

B.FormField = class FormField extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Forms.fields';
  }
};

B.FormGroup = class FormGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Forms.groups';
  }
};

B.FormState = class FormState extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Forms.states';
  }
};

//
// JOBS
//

B.Job = class Job extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Jobs.jobs';
  }

  onGet_status(status) {
    switch (B.int(status)) {
      case 0:
        return 'Open';
      case 2:
        return 'High Priority';
      case 3:
        return 'Checked In';
      case 4:
        return 'Completed';
      case 5:
        return 'Paused';
      case 6:
        return 'Driving';
      case 7:
        return 'Driving Paused';
      case 8:
        return 'Driving Completed';
      default:
        return '';
    }
  }

  isOpen() {
    const status = B.int(this.get_raw('status'));
    return status !== 4;
  }
};

B.JobGroup = class JobGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Jobs.groups';
  }
};

B.JobProduct = class JobGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Jobs.jobproducts';
  }
};

//
// PROJECTS
//

B.Project = class Project extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.projects';
  }
};

B.ProjectAssetGroup = class ProjectAssetGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.assetgroups';
  }
};

B.ProjectGroup = class ProjectGroup extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.groups';
  }
};

B.ProjectMilestone = class ProjectMilestone extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.milestones';
  }
};

B.ProjectMilestoneTemplate = class ProjectMilestoneTemplate extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.milestonetemplates';
  }
};

B.ProjectActivity = class ProjectActivity extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.projectactivities';
  }
};

B.ProjectProduct = class ProjectProduct extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.projectproducts';
  }
};

B.ProjectTemplate = class ProjectTemplate extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.projectemplates';
  }
};

B.ProjectStage = class ProjectStage extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.stages';
  }
};

B.ProjectTaskTemplate = class ProjectTaskTemplate extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.tasktemplates';
  }
};

B.ProjectAsset = class ProjectAsset extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Projects.assets';
  }
};

//
// SALES
//

B.Quote = class Quote extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Sales.quotes';
  }

  getProducts() {
    return B.QuoteProducts.select({
      quoteid: this.get('id'),
    });
  }
};

B.CatalogProduct = class CatalogProduct extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Sales.products';
  }
};

B.QuoteProduct = class QuoteProduct extends B.QueryItem {
  constructor(item) {
    super(item);
    this._table = 'Sales.quoteproducts';
  }

  getCatalogProduct() {
    return B.CatalogProducts.selectId(this.get('productid'));
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// QUERY FACTORY
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.QueryFactory = class QueryFactory {
  constructor(table = x`table`, carrier = x`carrier`) {
    this.table = table;
    this.carrier = carrier;
  }

  select(query = '', sort = '') {
    const items = B.query.select(this.table, query, sort);
    return new B.ResultSet(this.table, items, this.carrier, query, sort);
  }

  selectOne(query = '', sort = '') {
    const item = B.query.select(this.table, query, sort)[0];

    if (item) {
      return new this.carrier(item);
    }
  }

  selectId(id = x`id`) {
    const item = B.query.selectId(this.table, id);

    if (item) {
      return new this.carrier(item);
    }
  }

  selectIn(field = x`field`, list = x`list`, sort = '') {
    const items = B.query.selectIn(this.table, field, list, sort);
    return new B.ResultSet(this.table, items, this.carrier, B.util.createIn(field, list), sort);
  }
};

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

B.date = {
  SECOND: 1000,
  MINUTE: 1000 * 60,
  HOUR: 1000 * 60 * 60,
  DAY: 1000 * 60 * 60 * 24,
  WEEK: 1000 * 60 * 60 * 24 * 7,

  getTimeInDay(time = x`time`) {
    const d = new Date(time);
    return d.getTime() % B.date.DAY;
  },

  now() {
    return (new Date()).getTime();
  },

  today() {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return d.getTime();
  },

  //
  // Converts a date to a string more appropriate for display to the user (14 Jul 2017)
  //
  commonDateString(date = x`date`) {
    let dateString = '';
    let tempDate = date;

    if (!(date instanceof Date)) {
      tempDate = new Date(parseInt(date));
    }

    dateString = tempDate.toString().split(' ');
    dateString = `${dateString[2]} ${dateString[1]} ${dateString[3]}`;

    return dateString;
  },

  dayOfWeek() {
    //
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TYPE CASTING UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.int = (item) => parseInt(B.num(item));

B.float = (item) => parseFloat(B.num(item));

B.num = (item) => {
  const num = Number(item);

  if (isNaN(num)) {
    return 0;
  } else {
    return num;
  }
};

B.str = (item) => {
  if (item == undefined || typeof item === 'function' || typeof item === 'object') {
    return '';
  }

  const str = String(item);

  if (str === 'NaN') {
    return '';
  } else {
    return str;
  }
};

B.arr = (item) => {
  if (typeof item === 'undefined' || item == null) {
    return [];
  }

  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
};

B.noop = () => {
  // empty function
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// STRING UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.string = {
  padStart(item = x`item`, num = x`num`) {
    let str = B.str(item);
    while (str.length < num) {
      str = '0' + str;
    }
    return str;
  },

  padEnd(item = x`item`, num = x`num`) {
    let str = B.str(item);
    while (str.length < num) {
      str = str + '0';
    }
    return str;
  },

  pluralise(singularForm = x`singularForm`, pluralForm = x`pluralForm`, count = x`count`, include = false) {
    let form = '';

    if (count === 1) {
      form = singularForm;
    } else {
      form = pluralForm;
    }

    return !!include ? `${count} ${form}` : form;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// NUMBER UTILS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.number = {
  round0(num) {
    return B.num(num).toFixed(0);
  },

  round1(num) {
    return B.num(num).toFixed(1);
  },

  round2(num) {
    return B.num(num).toFixed(2);
  },

  commify(num) {
    const parts = B.str(num).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },

  commify0(num) {
    return B.number.commify(B.number.round0(num));
  },

  commify1(num) {
    return B.number.commify(B.number.round1(num));
  },

  commify2(num) {
    return B.number.commify(B.number.round2(num));
  },

  //
  // Convert a float to a string (with a dollar sign, comma separated)
  //
  currency(num) {
    return `$${B.number.commify2(num)}`;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// FORMAT
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.format = {
  commonDateString(...args) {
    return B.date.commonDateString(...args);
  },

  currency(...args) {
    return B.number.currency(...args);
  },

  padStart(...args) {
    return B.string.padStart(...args);
  },

  padEnd(...args) {
    return B.string.padEnd(...args);
  },

  shortDate(ms = B.date.now()) {
    const date = B.util.ensureDateObj(ms);
    const year = date.getFullYear();
    const month = B.string.padStart(date.getMonth() + 1, 2);
    const day = B.string.padStart(date.getDate(), 2);
    return `${day}/${month}/${year}`;
  },

  shortTime(ms = B.date.now()) {
    const d = B.util.ensureDateObj(ms);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ext = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    minutes = B.string.padStart(minutes, 2);
    return `${hours}:${minutes}${ext}`;
  },

  shortDateTime(ms = B.date.now()) {
    return `${B.format.shortTime(ms)} ${B.format.shortDate(ms)}`;
  },

  commonDateTime(ms = B.date.now()) {
    return `${B.format.shortTime(ms)} ${B.format.commonDateString(ms)}`;
  },

  date(ms = B.date.now()) {
    return Format.date(ms);
  },

  time(ms = B.date.now()) {
    return Format.time(ms);
  },

  dateTime(ms = B.date.now()) {
    return Format.datetime(ms);
  },

  capitalise(item = x`item`) {
    const str = B.str(item);

    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return '';
    }
  },

  title(item = x`item`) {
    const list = B.str(item).split(' ');
    return B.util.map(list, B.format.capitalise).join(' ');
  },

  distance(metres = x`metres`) {
    metres = B.int(metres);
    if (metres < 1000) {
      return `${metres}m`;
    } else {
      return `${B.number.commify1(metres / 1000)}km`;
    }
  },

  multiValue(item = x`item`) {
    return B.str(item).replace(/\|/g, ', ');
  },

  upviseLink(table = x`table`, id = x`id`, name = '') {
    if (table == "" || id == "" || id == null)
      return "";
    if (table == "Forms.forms") {
      id = id.split(":")[0];
    }
    const item = Query.selectId(table, id);
    if (item == null)
      return "";
    let func = ""; // TODO - make this shit a switch statement in a separate function
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
    name = name || item.name;
    if (table == "Forms.forms" && !name) {
      name = `${B.query.names("Forms.templates", item.templateid)} ${item.name}`;
    }
    func = _func(func, id);
    const onclick = `event.cancelBubble=true;${_func("Engine.eval", func)}`;
    return `<a class=link onclick="${onclick}">${name}</a>`;
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// UTIL
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.util = {
  ensureDateObj(date = new Date()) {
    if (!(date instanceof Date)) {
      return new Date(B.int(date));
    }
    return date;
  },

  //
  // Creates a string of a function with paramaters
  //
  func(functionName = x`functionName`, paramaters = []) {
    return `${functionName}(${paramaters.join(',')})`;
  },

  //
  // Create an Engine.eval() string with paramaters
  //
  engineCall(functionName = x`functionName`, paramaters = []) {
    return B.util.func('Engine.eval', [B.util.esc(B.util.func(functionName, paramaters))]);
  },

  //
  // Creates an array of specified attributes in an array of objects.
  //
  pluck(arrayOfObjects = x`arrayOfObjects`, key = x`key`) {
    const result = [];

    for (const item of arrayOfObjects) {
      if (item && item[key]) {
        result.push(item[key]);
      }
    }

    return result;
  },

  each(list = x`list`, callback = B.noop) {
    const keys = Object.keys(list);
    const isArray = Array.isArray(list);

    for (const key of keys) {
      const value = list[key];
      const index = isArray ? B.int(key) : key;
      callback(value, index);
    }
  },

  //
  // Maps over a collection and applies the transformation function. Returns a new array.
  //
  map(list = x`list`, mappingFunction = B.noop) {
    const keys = Object.keys(list);
    const isArray = Array.isArray(list);
    let result = isArray ? [] : {};

    for (const key of keys) {
      const value = list[key];
      const indexOrKey = isArray ? B.int(key) : key;
      result[key] = mappingFunction(value, indexOrKey);
    }

    return result;
  },

  createIn(key = x`key`, list = x`list`) {
    const items = B.util.map(list, B.util.esc).join(', ');
    return `${key} IN (${items})`;
  },

  expand(list = x`list`, key = x`key`) {
    const result = {};

    for (const item of list) {
      if (item[key]) {
        result[item[key]] = item;
      }
    }

    return result;
  },

  expandList(list = x`key`, key = x`key`) {
    const result = {};

    for (const item of list) {
      const itemKey = item[key];

      if (itemKey) {
        if (result[itemKey]) {
          result[itemKey].push(item);
        } else {
          result[itemKey] = [item];
        }
      }
    }

    return result;
  },

  esc(str = x`str`) {
    return "'" + B.str(str) + "'";
  },

  isEmpty(obj) {
    if (obj == null || obj == undefined || typeof obj === 'undefined') {
      return true;
    } else if (Array.isArray(obj)) {
      return obj.length === 0;
    } else {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
  },

  merge(one = {}, two = {}, three = {}, four = {}, five = {}) {
    return {...one, ...two, ...three, ...four, ...five};
  },

  quickClone(obj = x`obj`) {
    return JSON.parse(JSON.stringify(obj));
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
// MIGRATIONS
//
////////////////////////////////////////////////////////////////////////////////////////////////////

B.migrations = {
  renameCustomField(formid = x`formid`, table = x`table`, oldId = x`oldId`, newId = x`newId`, dryrun = true) {
    dryrun && B.logger.info('Running renameCustomField in dry run mode.');

    const field = B.query.selectOne('Notes.fields', {
      formid,
      name: oldId,
    });

    if (!field) {
      return B.logger.error('Custom field not found');
    }

    B.logger.log('Working on field', field);
    B.logger.log(`${oldId} -> ${newId}`);

    if (!dryrun) {
      Query.updateId('Notes.fields', field.id, 'name', newId);
    }

    const items = Query.select(table, '*', 'custom != ""');
    for (const item of items) {
      const custom = JSON.parse(item.custom || '{}');
      const value = custom[oldId]; // Note to self: scalar primitives (number, string, etc) are passed by value so this is safe.

      if (value) {
        custom[newId] = value;
        delete custom[oldId];

        B.logger.log(`Writing new custom fields for ${esc(item.name)}`, custom);

        if (!dryrun) {
          Query.updateId(table, item.id, 'custom', JSON.stringify(custom));
        }
      }
    }

    !dryrun && Engine.refresh();
  },
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
  B.logger.info(`Billow.js version: v${B.VERSION}`);
  window.B = B;
} catch (err) {
  //
}
