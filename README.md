# brettle:accounts-add-service

[![Build Status](https://travis-ci.org/brettle/meteor-accounts-add-service.svg?branch=master)](https://travis-ci.org/brettle/meteor-accounts-add-service)

Allow users to add login services to their accounts.

This package is part of the `brettle:accounts-*` suite of packages. See
[`brettle:accounts-deluxe`](https://atmospherejs.com/brettle/accounts-deluxe)
for an overview of the suite and a live demo.

## Features

- When a logged in user attempts to login using credentials that don't belong to
  an existing user, this package adds those credentials to the logged in user, so they are available for future logins. Any other top-level or profile properties that would have
  been associated with a new user with those credentials are also non-destructively
  merged into the existing user.

- When a logged in user tries to login using credentials that belong to an
  existing user, the user is logged in as the existing user (unless that is
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
