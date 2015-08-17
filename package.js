Package.describe({
  name: 'brettle:accounts-add-service',
  version: '0.2.0',
  summary: 'Allow users to add login services to their accounts',
  git: 'https://github.com/brettle/meteor-accounts-add-service.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4');
  api.use('accounts-base');
  api.use('underscore');
  api.use('ddp');
  api.use('ejson');
  api.use('mongo');
  api.use('callback-hook');
  api.use('brettle:accounts-multiple@0.0.1', 'server');
  api.export('AccountsAddService');
  api.addFiles('workaround-issue-4331.js', 'client');
  api.addFiles('workaround-issue-4970.js', 'client');
  api.addFiles('accounts-add-service-common.js');
  api.addFiles('accounts-add-service-server.js', 'server');
});

Package.onTest(function(api) {
  api.versionsFrom('1.0.4');
  api.use('tinytest');
  api.use('brettle:accounts-add-service@0.1.0');
  api.use('brettle:accounts-testing-support@0.1.0');
  api.use('brettle:accounts-multiple@0.1.0', 'server');
  api.use('accounts-base');
  api.addFiles('workaround-issue-4331-tests.js', 'client');
  api.addFiles('workaround-issue-4970-tests.js', 'client');
  api.addFiles('accounts-add-service-server-tests.js', 'server');
});
