"use strict";

Package.describe({
  name: 'brettle:accounts-add-service',
  version: '0.3.0',
  summary: 'Allow users to add login services to their accounts',
  git: 'https://github.com/brettle/meteor-accounts-add-service.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4');
  api.use('underscore');
  api.use('brettle:workaround-issue-4331@0.0.1');
  api.use('brettle:workaround-issue-4970@0.0.1');
  api.use('brettle:accounts-multiple@0.0.1', 'server');
  api.export('AccountsAddService');
  api.addFiles('accounts-add-service-common.js');
  api.addFiles('accounts-add-service-server.js', 'server');
});

Package.onTest(function(api) {
  api.versionsFrom('1.0.4');
  api.use('tinytest');
  api.use('brettle:accounts-add-service@0.2.0');
  api.use('brettle:accounts-testing-support@0.1.0');
  api.use('brettle:accounts-multiple@0.1.0', 'server');
  api.addFiles('accounts-add-service-server-tests.js', 'server');
});
