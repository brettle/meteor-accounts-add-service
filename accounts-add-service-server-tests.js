/* globals AccountsAddService, AccountsMultiple */
"use strict";
Tinytest.add(
  'brettle:accounts-add-service - logged out user logging in succeeds',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAddService._init();
    var connection = DDP.connect(Meteor.absoluteUrl());

    Meteor.users.remove({ 'services.test1.name': "testname" });
    var testId = connection.call('login', { test1: "testname" }).id;
    test.isNotUndefined(testId);
    test.isNotNull(testId);
  }
);

Tinytest.add(
  'brettle:accounts-add-service - logged in user adds service merges profile',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAddService._init();
    var connection = DDP.connect(Meteor.absoluteUrl());

    Meteor.users.remove({ 'services.test1.name': "testname"});
    var testId = connection.call('login', {
      test1: "testname",
      docDefaults: {
        username: 'testname'
      }
    }).id;
    test.isNotUndefined(testId);
    test.isNotNull(testId);
    var user = Meteor.users.findOne(testId);
    test.isUndefined(user.services.test2);

    Meteor.users.remove({ 'services.test2.name': "test2name"});
    test.throws(function () {
      connection.call('login', {
        test2: "test2name",
        docDefaults: {
          emails: [ { address: 'test2@example.com' } ],
          username: 'test2name',
          profile: { name: 'test2name' }
        }
      });
    }, 'Service will be added');

    user = Meteor.users.findOne(testId);
    test.isNotUndefined(user.services.test2, 'user.services.test2 defined');
    test.isNotNull(user.services.test2, 'user.services.test2 not null');
    test.equal(user.profile.name, 'test2name', 'merge profile');
    test.equal(user.emails[0].address, 'test2@example.com', 'merge top-level');
    test.equal(user.username, 'testname', 'merge top-level non-destructively');

    connection.call('logout');
    var test2Id = connection.call('login', { test2: "test2name" }).id;
    test.equal(test2Id, testId, 'ids match');
  }
);

Tinytest.add(
  'brettle:accounts-add-service - logged in user switches to existing user',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAddService._init();
    var connection = DDP.connect(Meteor.absoluteUrl());

    Meteor.users.remove({ 'services.test2.name': "test2name"});
    var test2Id = connection.call('login', { test2: "test2name" }).id;
    test.isNotUndefined(test2Id);
    test.isNotNull(test2Id);

    connection.call('logout');
    Meteor.users.remove({ 'services.test1.name': "testname"});
    var testId = connection.call('login', { test1: "testname" }).id;
    test.isNotUndefined(testId);
    test.isNotNull(testId);
    var user = Meteor.users.findOne(testId);
    test.equal(user.services.test1.name, 'testname');

    var newTest2Id = connection.call('login', { test2: "test2name" }).id;
    test.notEqual(newTest2Id, testId, 'not test id');
    test.equal(newTest2Id, test2Id, 'same as original user');

    user = Meteor.users.findOne(newTest2Id);
    test.isUndefined(user.services.test1, 'no user.services.test1');
  }
);
