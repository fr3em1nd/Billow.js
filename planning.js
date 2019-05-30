//
// Copyright Platformers (C) 2019
//

//
// Get a select some contacts. Returns an array of Contact classes
//
Contacts.select({name: 'Nathan'}, 'name DESC');

//
// Modify a form
//
var f = Forms.selectId('1234');
f.value.F22 = Date.now();
f.save();

var nathan = new Contact({
  name: 'Nathan',
  email: 'hello@nathan.com.au',
});

nathan.phone = 12341234;
nathan.id

nathan.save();

nathan.delete();
nathan.archive();

//
// Each form item class needs to be able to specify default values as a function
// Each form item class needs to be able to specify functions for receiving data and before saving
//
