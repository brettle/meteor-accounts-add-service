/* globals AccountsAddService, AccountsMultiple
*/
"use strict";
var mergeUserErrorReason = AccountsAddService._mergeUserErrorReason;

AccountsAddService.databaseMigrationEnabled = true;

AccountsAddService._migrationControl = 
  new Mongo.Collection("AccountsAddService._migrationControl");

// returns false if the migration isn't run, or the number of users updated
// if it is.
AccountsAddService._migrateDatabase = function () {
  if (! AccountsAddService.databaseMigrationEnabled) {
    return false;
  }
  var addHasLoggedIn = 
    AccountsAddService._migrationControl.findOne('addHasLoggedIn');
  if (addHasLoggedIn && addHasLoggedIn.startedAt) {
    return false;
  }
  if (! addHasLoggedIn) {
    try {
      AccountsAddService._migrationControl.insert({ _id: 'addHasLoggedIn' });
    } catch (err) {
      // Ignore duplicate key error thrown if already id already exists due to
      // concurrent insertion attempts
      if (! (err.name === 'MongoError' && err.message.indexOf('E11000'))) {
        throw err;
      }
    }
  }
  var numAffected = AccountsAddService._migrationControl.update({
    _id: 'addHasLoggedIn',
    startedAt: { $exists: false }
   }, {
    $set: {
      startedAt: new Date(),
    }
  });
  // Only one server will return numAffected !== 0. When numAffect === 0,
  // The migration was already started (and possibly finished)
  if (numAffected === 0) {
    return false;
  }
  
  var selector = { 
    hasLoggedIn: { $exists: false }, 
    'services.resume': { $exists: true }
  };
  var numUsersUpdated = Meteor.users.update(selector, {
    $set: { hasLoggedIn: true }
  });
  if (numUsersUpdated > 0) {
    console.log('brettle:accounts-add-service set hasLoggedIn = true for ' +
      numUsersUpdated + ' existing user(s).');  
  }
  AccountsAddService._migrationControl.update({
    _id: 'addHasLoggedIn',
   }, {
    $set: {
      finishedAt: new Date(),
    }
  });
  return numUsersUpdated;
};

Meteor.startup(AccountsAddService._migrateDatabase);

// The first time a user logs in, we set his hasLoggedIn property so that
// we don't accidentally merge his account if his "resume" service is removed.
Accounts.onLogin(function (attemptInfo) {
  if (attemptInfo.user && ! attemptInfo.user.hasLoggedIn) {
    Meteor.users.update(attemptInfo.user._id, {
      $set: { hasLoggedIn: true }
    });
  }
});

function isMergeable(user) {
  // A user should be merged if they have never logged in. If they have
  // never logged in, they won't have a "resume" service and they won't have
  // the `hasLoggedIn` property.
  return !(user.services && user.services.resume) && !(user.hasLoggedIn);
}

AccountsAddService._init = function () {
  AccountsMultiple.register(addServiceCallbackSet);
};

var addServiceCallbackSet = {
  validateSwitch: function(attemptingUser, attempt) {
    if (isMergeable(attempt.user)) {
      throw new Meteor.Error(Accounts.LoginCancelledError.numericError,
        mergeUserErrorReason);
    }
    return true;
  },
  onSwitchFailure: function(attemptingUser, failedAttempt) {
    if (!failedAttempt.error ||
      !failedAttempt.error.error || !failedAttempt.error.reason ||
      failedAttempt.error.error !== Accounts.LoginCancelledError.numericError ||
      failedAttempt.error.reason !== mergeUserErrorReason) {
      return;
    }
    var serviceName = failedAttempt.type;
    var serviceData = failedAttempt.user.services[serviceName];

    // Repin any pinned oauth credentials to the logged in user
    if (serviceName !== "password" && serviceName !== "resume") {
      repinCredentials(serviceData, failedAttempt.user._id, attemptingUser._id);
    }

    Meteor.users.remove(failedAttempt.user._id);

    // Copy the serviceData into Meteor.user.services[serviceName]
    var setAttrs = {};
    _.each(serviceData, function(value, key) {
      setAttrs["services." + serviceName + "." + key] = value;
    });

    // Non-destructively merge profile properties
    var attemptingProfile = attemptingUser.profile || {};
    var attemptProfile = failedAttempt.user.profile;
    attemptProfile = _.omit(attemptProfile, _.keys(attemptingProfile));
    _.each(attemptProfile, function(value, key) {
      setAttrs["profile." + key] = value;
    });

    // Non-destructively merge emails
    if (failedAttempt.user.emails) {
      var attemptingEmails = attemptingUser.emails || [];
      var attemptEmails = failedAttempt.user.emails;
      var mergedEmails = attemptingEmails.concat(attemptEmails);
      mergedEmails = _.uniq(mergedEmails, false, function (email) { 
        return email.address;
      });
      setAttrs.emails = mergedEmails;
    }

    // Non-destructively merge email verification tokens
    if (failedAttempt.user.services && 
        failedAttempt.user.services.email && 
        failedAttempt.user.services.email.verificationTokens) {
      var attemptingTokens = (
        attemptingUser.services && 
        attemptingUser.services.email && 
        attemptingUser.services.email.verificationTokens
      ) || [];
      var attemptTokens = failedAttempt.user.services.email.verificationTokens;
      var mergedTokens = attemptingTokens.concat(attemptTokens);
      mergedTokens = _.uniq(mergedTokens, false, function (tokenRecord) { 
        return tokenRecord.token;
      });
      setAttrs["services.email.verificationTokens"] = mergedTokens;
    }

    // Non-destructively merge top-level properties
    var attemptingTop = attemptingUser || {};
    var attemptTop = failedAttempt.user;
    attemptTop = _.omit(attemptTop, _.keys(attemptingTop));
    delete attemptTop.profile; // handled above
    delete attemptTop.emails; // handled above
    delete attemptTop.services; // handled above
    _.each(attemptTop, function(value, key) {
      setAttrs[key] = value;
    });

    Meteor.users.update(attemptingUser._id, {
      $set: setAttrs
    });
  }
};

var OAuthEncryption = Package["oauth-encryption"] &&
  Package["oauth-encryption"].OAuthEncryption;

function repinCredentials(serviceData, oldUserId, newUserId) {
  _.each(_.keys(serviceData), function(key) {
    var value = serviceData[key];
    if (OAuthEncryption && OAuthEncryption.isSealed(value)) {
      value =
        OAuthEncryption.seal(OAuthEncryption.open(value, oldUserId), newUserId);
    }
    serviceData[key] = value;
  });
}

AccountsAddService._init();
