// Workaround Meteor issue #4970 by remembering the onReconnect handler from the
// most recent successful login and using it if a login failure occurs. For
// Meteor releases prior to 1.2, this requires using the workaround for issue
// #4331.
var mostRecentOnReconnectHandler;
Accounts.onLogin(function () {
  mostRecentOnReconnectHandler = Accounts.connection.onReconnect;
});
Accounts.onLoginFailure(function () {
  if (! Accounts.connection.onReconnect) {
    Accounts.connection.onReconnect = mostRecentOnReconnectHandler;
  }
});
