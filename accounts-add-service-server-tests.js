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
    
    // Make sure we don't just rely on the existence of the 'resume' service.
    // See https://github.com/brettle/meteor-accounts-add-service/issues/1
    Meteor.users.update({ 'services.test2.name': "test2name"}, {
      $unset: {'services.resume': ''}
    });

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

Tinytest.add(
  'brettle:accounts-add-service - add hasLoggedIn to existing resume users',
  function (test) {
    AccountsMultiple._unregisterAll();
    AccountsAddService._init();
    var connection = DDP.connect(Meteor.absoluteUrl());
    
    // Add a user who logged in after 0.3.5 and didn't lose his resume service
    // (i.e. has services.resume and hasLoggedIn). This user should be left
    // alone.
    connection.call('login', { test1: "resumeYesHasLoggedInYes" });

    // Add a user who didn't log in or logged in before 0.3.5 but lost his
    // resume service (i.e. has neither services.resume nor hasLoggedIn). This
    // user should be left alone because we can't tell which is the case.
    Meteor.users.update(connection.call('login', { 
      test1: "resumeNoHasLoggedInNo" 
    }).id, {
      $unset: {
        hasLoggedIn: '',
        'services.resume': ''
      }
    });    
    
    // Add a user who logged in after 0.3.5 and lost his resume service (i.e.
    // doesn't have services.resume but has hasLoggedIn). This user should be
    // left alone.
    Meteor.users.update(connection.call('login', {
      test1: "resumeNoHasLoggedInYes" 
    }).id, {
      $unset: {
        'services.resume': ''
      }
    });

    // Add a user who logged in before 0.3.5 and didn't lose his resume service
    // (i.e. has services.resume but not hasLoggedIn). This user should get
    // hasLoggedIn added.
    var resumeYesHasLoggedInNoId = 
      connection.call('login', { test1: "resumeYesHasLoggedInNo" }).id;
    Meteor.users.update(resumeYesHasLoggedInNoId, {
      $unset: { hasLoggedIn: '' }
    });
        
    connection.call('logout');
    
    var usersAdded = [];
    var usersRemoved = [];
    var usersChanged = [];
    var observer = Meteor.users.find().observeChanges({
      added: function (newUserId) {
        usersAdded.push(newUserId);
      },
      changed: function (userId, fields) {
        usersChanged.push({ userId: userId, fields: fields });
      },
      removed: function (oldUserId) {
        usersRemoved.push(oldUserId);
      }
    });
    usersAdded = []; // Ignore the users that were there already
    
    // Clear the control collection
    AccountsAddService._migrationControl.remove({}); 

    AccountsAddService.databaseMigrationEnabled = false;
    test.isFalse(AccountsAddService._migrateDatabase(), 'migration disabled');
    waitForCallbacksToFinish();
    test.equal(usersAdded.length + usersRemoved.length + usersChanged.length, 0,
      'no users affected when migration disabled');
    
    AccountsAddService.databaseMigrationEnabled = true;
    test.equal(AccountsAddService._migrateDatabase(), 1, '1 user updated');
    waitForCallbacksToFinish();
    test.equal(usersAdded.length + usersRemoved.length, 0, 
      'no users added/removed when migration enabled');
    test.equal(usersChanged, [{
      userId: resumeYesHasLoggedInNoId,
      fields: {
        hasLoggedIn: true
      }
    }], 'only updated user who has resume service but not hasLoggedIn');

    // Unmigrate the user for the remainder of the test
    Meteor.users.update(resumeYesHasLoggedInNoId, {
      $unset: { hasLoggedIn: '' }
    });
    waitForCallbacksToFinish();
    usersAdded = [];
    usersRemoved = [];
    usersChanged = [];
    test.isFalse(AccountsAddService._migrateDatabase(), 'migrate only once');
    waitForCallbacksToFinish();
    test.equal(usersAdded.length + usersRemoved.length + usersChanged.length, 0,
      'no users affected when already migrated');

    AccountsAddService._migrationControl.update('addHasLoggedIn', {
      $set: {
        startedOn: new Date()
      }
    });
    test.isFalse(AccountsAddService._migrateDatabase(), 'migrate in progress');
    waitForCallbacksToFinish();
    test.equal(usersAdded.length + usersRemoved.length + usersChanged.length, 0,
      'no users affected when migration in progress');

    observer.stop();
  }

);

// Wait until the observeChanges callbacks have been called before returning. To
// do this, we insert into to a separate collection that we observe, and assume
// that by the time that the added callback is called on our collection, all
// other observe callbacks have already been called.
var testCollection = new Mongo.Collection("AccountsAddServiceTest");
var waitForCallbacksToFinish = Meteor.wrapAsync(function (cb) {
  testCollection.remove({});
  var observer = testCollection.find().observe({
    added: function () {
      observer.stop();
      cb.call();
    }
  });
  testCollection.insert({});
});
