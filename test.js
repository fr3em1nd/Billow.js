//
// Copyright Platformers (C) 2019
//

//
// Load Billow.js
//
function loadBillowJs() {
  var item = Query.selectId('System.globalsettings', 'billow-software.billow.js');
  if (item) {
    var code = item.value;
    if (typeof window === 'undefined') {
      return new Function(code + ';return B;')();
    } else if (window.B && window.B.VERSION === item.name) {
      new Function(code)();
      return window.B;
    } else {
      new Function(code)();
      return window.B;
    }
  } else {
    throw new Error('Critical failure: B.js is not deployed to this database');
  }
}
var B = loadBillowJs();

//
// Really basic assert function because Upvise mobile doesn't like console.assert
//
function assert(condition, expectation) {
  if (condition == expectation) {
    return true;
  } else {
    console.error('Test error:', condition, expectation);
    throw new Error('Billow.js tests failed');
  }
};

//
// Write tests here...
//
function runTests() {
  assert(B.query.select('Forms.forms').length > 1, true);
  assert(B.query.select('non-existant-table').length, 0);

  var jobgroup = B.JobGroups.selectId('08CC1CCBA92457A36686003939776E');
  var jobs = jobgroup.getLinkedJobs();
  assert(jobs.count() > 0, true);

  assert(jobs.isEmpty(), false);
  assert(typeof jobs.keyBy('id'), 'object');
  assert(typeof jobs.listBy('groupid'), 'object');
  assert(typeof jobs.pluck('name'), 'object');

  assert(B.query._checkTable('Forms.forms'), true);
  assert(B.query._checkTable('Jobs.jobs'), true);
  assert(B.query._checkTable('Sales.quotes'), true);
  assert(B.query._checkTable('fuckoff'), false);
  assert(B.query._checkTable('sex'), false);

  assert(B.query._getTableKeys('Forms.forms').length > 0, true);
  assert(B.query._getTableKeys('Notes.notes').length > 0, true);
  assert(B.query._getTableKeys('non-existant-table').length === 0, true);
};

//
// Run the tests
//
try {
  runTests();
  App.confirm('Tests have passed.');
} catch (err) {
  console.log(err);
  console.log(err.stack);
}
