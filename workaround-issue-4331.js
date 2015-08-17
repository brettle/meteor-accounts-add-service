// Workaround Meteor issue #4331 for releases < 1.2:
// https://github.com/meteor/meteor/issues/4331
//
// Do nothing for versions of Accounts which don't require this workaround
if (Accounts._onLoginHook) {
  return;
}

// Maintain our own set of hooks
var onLoginHook = new Hook({
  debugPrintExceptions: 'Workaround4331 onLogin callback'
});

var onLoginFailureHook = new Hook({
  debugPrintExceptions: 'Workaround4331 onLoginFailure callback'
});

// Monkey patch Accounts.onLogin and Accounts.onLoginFailure to register the
// callbacks with our hooks instead of the ones maintained by Accounts.
var accountsOnLogin = Accounts.onLogin;
Accounts.onLogin = function(func) {
  return onLoginHook.register(func);
};
var accountsOnLoginFailure = Accounts.onLoginFailure;
Accounts.onLoginFailure = function(func) {
  return onLoginFailureHook.register(func);
};

// Monkey patch Accounts.callLoginMethod to wrap the userCallback option with a
// function which calls our hooks before calling the userCallback.
var accountsCallLoginMethod = Accounts.callLoginMethod;
Accounts.callLoginMethod = function (options) {
  options = _.clone(options);
  var origUserCallback = options.userCallback || function () {};
  options.userCallback = function (error) {
    if (!error) {
      onLoginHook.each(function (callback) {
        callback();
        return true;
      });
    } else {
      onLoginFailureHook.each(function (callback) {
        callback();
        return true;
      });
    }
    return origUserCallback.apply(this, arguments);
  };
  return accountsCallLoginMethod.call(this, options);
};
