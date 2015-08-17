Tinytest.addAsync('Workaround4970 - Workaround meteor bug #4970',
  function(test, done) {
    // Make sure we get logged in again if we reconnect after adding a service
    Accounts.callLoginMethod({
      methodArguments: [{
        test1: "test1-" + Random.id()
      }],
      userCallback: onUser1LoggedIn
    });

    function onUser1LoggedIn(err) {
      test.isUndefined(err, 'Unexpected error logging in as first user');
      test.isNotNull(Accounts.connection.onReconnect, 'onReconnect is null after first user logged in');
      Accounts.callLoginMethod({
        methodArguments: [{
          test2: "test2-" + Random.id()
        }],
        userCallback: onUser2Added
      });
    }

    var onLoginStopper;
    var timeoutHandle;
    function onUser2Added(err) {
      test.instanceOf(err, Meteor.Error, "Did not receive Meteor.error");
      test.equal(err.reason, AccountsAddService._mergeUserErrorReason);
      test.isNotNull(Accounts.connection.onReconnect, 'onReconnect is null');
      onLoginStopper = Accounts.onLogin(loggedInAfterReconnect);
      timeoutHandle = Meteor.setTimeout(failedToLoginAfterReconnect, 1000);
      Meteor.disconnect();
      Meteor.reconnect();
    }

    function loggedInAfterReconnect() {
      Meteor.clearTimeout(timeoutHandle);
      onLoginStopper.stop();
      done();
    }

    function failedToLoginAfterReconnect() {
      onLoginStopper.stop();
      test.fail('Failed to login after reconnecting.');
      done();
    }
  }
);
