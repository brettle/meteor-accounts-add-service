# accounts-add-service
============

Allow users to add login services to their accounts.

## Features

- When a logged in user attempts to login using credentials that don't belong to
  an existing user, those credentials are added to the logged in user, so they can be
  used for future logins.

- When a logged in user tries to login using credentials that belong to an
  existing user, the user is logged in as the existing user unless it is
  otherwise prevented (e.g. by brettle:accounts-logout-to-switch).

- Works with any login service (accounts-password, acccounts-google, etc.)

- Works with accounts-ui and other similar packages.

- Does not permanently monkey patch Meteor core.

## Installation
```sh
meteor add brettle:accounts-add-service
```

## Usage

Nothing to do. It should just work once it is installed.
