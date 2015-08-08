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
  test.equal(user.profile.test2_specific, 'test2name', 'merge');
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
