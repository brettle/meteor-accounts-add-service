# Change Log
This file documents all notable changes to this project. 
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.0.0] 2015-12-13

### Changed

Moved the fix for brettle/meteor-accounts-deluxe#1 (Red text error message when adding password account) into optional `brettle:accounts-patch-ui` package which patches the `accounts-ui` package and the `useraccounts` suite to workaround the problem.

## [0.3.5] 2015-11-13

### Fixed

Bug #1: Existing account without resume service deleted if logged in user logs
into it. For details, see the [Notes section of README.md](README.md#notes)

## [0.3.4] 2015-11-09

### Fixed

Bug #3: Missing email expiration tokens

## [0.3.3] 2015-09-26

### Fixed

Support Meteor 1.2.

## [0.3.2] 2015-09-26

### Fixed

Support Meteor 1.2.

## [0.3.1] 2015-09-07

### Fixed

Bug brettle/meteor-accounts-deluxe#1: Red text error message when using
`accounts-ui` to add password account.

## 0.3.0 2015-08-17

### Changed

Worked around meteor/meteor#4331 and moved all workarounds to their own
packages.

### Added

Support Meteor 1.0.4 or later.

[Unreleased]: https://github.com/brettle/meteor-accounts-add-service/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.5...v1.0.0
[0.3.5]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/brettle/meteor-accounts-add-service/compare/v0.3.0...v0.3.1
