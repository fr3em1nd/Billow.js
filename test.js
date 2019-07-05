//
// Copyright Platformers (C) 2019
//

//
// Load Billow.js
//
(function loadBillowJs() {
  var item = Query.selectId('System.globalsettings', 'billow-software.billow.js');
  if (!item) {
    console.error('Billow.js not deployed to this database');
    return;
  }
  eval(item.value);
})();

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
};

//
// Run the tests
//
runTests();
App.confirm('Tests have passed.');
