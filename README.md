# brettle:accounts-add-service

[![Build Status](https://travis-ci.org/brettle/meteor-accounts-add-service.svg?branch=master)](https://travis-ci.org/brettle/meteor-accounts-add-service)

Allow users to add login services to their accounts.

This package is part of the `brettle:accounts-*` suite of packages. See
[`brettle:accounts-deluxe`](https://atmospherejs.com/brettle/accounts-deluxe)
for an overview of the suite and a live demo.

## Features

- When a logged in user attempts to login using credentials that don't belong to
  an existing user, this package adds those credentials to the logged in user,
  so they are available for future logins. Any other top-level or profile
  properties that would have belonged to a new user with those credentials are
  also non-destructively merged into the existing user.

- When a logged in user tries to login using credentials that belong to an
  existing user, the user gets logged in as the existing user (unless that is
  otherwise prevented, for example by brettle:accounts-logout-to-switch).

- Works with any login service (accounts-password, acccounts-google, etc.)

- Works with accounts-ui and other similar packages.

- Does not permanently monkey patch Meteor core.

## Installation
```sh
meteor add brettle:accounts-add-service
```

## Usage

Nothing to do. It should just work once installed.

## Notes

This package adds a `hasLoggedIn` property to a user's account when he logs in,
and does a one-time migration to add the same property to existing users that
have the `resume` service created by the Meteor accounts system when a user logs
in. This is to ensure that a user counts as having logged in even if his
`resume` service is later removed (e.g. to force him to re-authenticate for
security reasons).

The migration runs from a `Meteor.startup` handler. It uses an internal
`Mongo.Collection` to keep track of whether it already started. This ensures
that it runs at most once and doesn't run on more than one server. If for some
reason you need to disable the migration, use:

```js
AccountsAddService.databaseMigrationEnabled = false;
```
