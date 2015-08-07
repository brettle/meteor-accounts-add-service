Accounts.registerLoginHandler("test1", function (options) {
    if (! options || ! options.test1) {
      return undefined;
    }
    var user = Meteor.users.findOne({ 'services.test1.name': options.test1 });
    if (user) {
      return { userId: user._id };
    }
    var newUserId = Accounts.insertUserDoc(options, {
      profile: {
        doNotOverride: options.test1
      },
      services: {
        test1: {
          name: options.test1
        }
      }
    });
    return {
        userId: newUserId
    };
});

Accounts.registerLoginHandler("test2", function (options) {
    if (! options || ! options.test2) {
      return undefined;
    }
    var user = Meteor.users.findOne({ 'services.test2.name': options.test2 });
    if (user) {
      return { userId: user._id };
    }
    var newUserId = Accounts.insertUserDoc(options, {
      profile: {
        doNotOverride: options.test2,
        specificToTest2: options.test2
      },
      services: {
        test2: {
          name: options.test2
        }
      }
    });
    return {
        userId: newUserId
    };
});


Tinytest.add('AccountsAddService - logged out user logging in succeeds', function (test) {
  var connection = DDP.connect(Meteor.absoluteUrl());

  Meteor.users.remove({ 'services.test1.name': "testname" });
  var testId = connection.call('login', { test1: "testname" }).id;
  test.isNotUndefined(testId);
  test.isNotNull(testId);
});

Tinytest.add('AccountsAddService - logged in user logging in as new user adds service and merges profile', function (test) {
  var connection = DDP.connect(Meteor.absoluteUrl());

  Meteor.users.remove({ 'services.test1.name': "testname"});
  var testId = connection.call('login', { test1: "testname" }).id;
  test.isNotUndefined(testId);
  test.isNotNull(testId);
  var user = Meteor.users.findOne(testId);
  test.isUndefined(user.services.test2);

  Meteor.users.remove({ 'services.test2.name': "test2name"});
  test.throws(function () {
    connection.call('login', { test2: "test2name" }).id;
  }, 'Service will be added');

  user = Meteor.users.findOne(testId);
  test.isNotUndefined(user.services.test2, 'user.services.test2 defined');
  test.isNotNull(user.services.test2, 'user.services.test2 not null');
  test.equal(user.profile.specificToTest2, 'test2name', 'merge');
  test.equal(user.profile.doNotOverride, 'testname', 'merge non-destructively');

  connection.call('logout');
  var test2Id = connection.call('login', { test2: "test2name" }).id;
  test.equal(test2Id, testId, 'ids match');
});

Tinytest.add('AccountsAddService - logged in user logging in as existing user switches to that user', function (test) {
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
});
