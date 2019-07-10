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

  console.log(jobs.keyBy('id'));
  console.log(jobs.listBy('groupid'));
  console.log(jobs.isEmpty());
  console.log(jobs.pluck('name'));
};

//
// Run the tests
//
runTests();
App.confirm('Tests have passed.');
