if (Meteor.isClient) {
  Tinytest.addAsync('Workaround4331 - Multiple onLogin callbacks', function (test, done) {
    var onLogin1Called;
    var onLogin1Stopper = Accounts.onLogin(function () {
      onLogin1Stopper.stop();
      onLogin1Called = true;
    });
    var onLogin2Called;
    var onLogin2Stopper = Accounts.onLogin(function () {
      onLogin2Stopper.stop();
      onLogin2Called = true;
      test.isTrue(onLogin1Called, 'onLogin1 not called');
      test.isTrue(onLogin2Called, 'onLogin2 not called');
      done();
    });
    Accounts.callLoginMethod({
      methodArguments: [{
        test1: "test1-" + Random.id()
      }]
    });
  });
  Tinytest.addAsync('Workaround4331 - Multiple onLoginFailure callbacks', function (test, done) {
    var onLoginFailure1Called;
    var onLoginFailure1Stopper = Accounts.onLoginFailure(function () {
      onLoginFailure1Stopper.stop();
      onLoginFailure1Called = true;
    });
    var onLoginFailure2Called;
    var onLoginFailure2Stopper = Accounts.onLoginFailure(function () {
      onLoginFailure2Stopper.stop();
      onLoginFailure2Called = true;
      test.isTrue(onLoginFailure1Called, 'onLoginFailure1 not called');
      test.isTrue(onLoginFailure2Called, 'onLoginFailure2 not called');
      done();
    });
    Accounts.callLoginMethod({
      methodArguments: [{
        bogusLoginService: "test1-" + Random.id()
      }]
    });
  });
}
