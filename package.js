"use strict";

Package.describe({
  name: 'brettle:accounts-add-service',
  version: '1.0.0',
  summary: 'Allow users to add login services to their accounts',
  git: 'https://github.com/brettle/meteor-accounts-add-service.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4');
  api.use('underscore');
  api.use('mongo');
  api.use('brettle:workaround-issue-4331@0.0.1');
  api.use('brettle:workaround-issue-4970@0.0.1');
  api.use('brettle:accounts-multiple@0.3.1', 'server');
  api.export('AccountsAddService');
  api.addFiles('accounts-add-service-common.js');
  api.addFiles('accounts-add-service-server.js', 'server');
});

Package.onTest(function(api) {
  api.versionsFrom('1.0.4');
  api.use('tinytest');
  api.use('ddp');
  api.use('accounts-base');
  api.use('accounts-password');
  api.use('mongo');
  api.use('brettle:accounts-add-service');
  api.use('brettle:accounts-testing-support@0.4.3');
  api.use('brettle:accounts-multiple@0.3.1', 'server');
  api.addFiles('accounts-add-service-server-tests.js', 'server');
});
