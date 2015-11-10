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
    Accounts.addEmail(testId, 'test1@example.com');
    Accounts.sendVerificationEmail(testId);
    var user = Meteor.users.findOne(testId);
    test.equal(user.services.email.verificationTokens.length, 1, "has token");
    var oldEmailVerificationToken = user.services.email.verificationTokens[0];
    test.isUndefined(user.services.test2);

    Meteor.users.remove({ 'services.test2.name': "test2name"});
    var newEmailVerificationToken = {
      token: "newToken",
      address: "newAddress",
      when: new Date()
    };
    test.throws(function () {
      connection.call('login', {
        test2: "test2name",
        docDefaults: {
          emails: [ { address: 'test2@example.com' } ],
          username: 'test2name',
          profile: { name: 'test2name' },
          services: {
            email: {
              verificationTokens: [newEmailVerificationToken]
            }
          }
        }
      });
    }, 'Service will be added');

    user = Meteor.users.findOne(testId);
    test.isNotUndefined(user.services.test2, 'user.services.test2 defined');
    test.isNotNull(user.services.test2, 'user.services.test2 not null');
    test.equal(user.profile.name, 'test2name', 'merge profile');
    test.equal(user.emails[0].address, 'test1@example.com', 'keep old emails');
    test.equal(user.emails[1].address, 'test2@example.com', 'add new emails');
    test.equal(user.username, 'testname', 'merge top-level non-destructively');
    test.equal(user.services.email.verificationTokens, 
      [oldEmailVerificationToken, newEmailVerificationToken], "token added");

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
