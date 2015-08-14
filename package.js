Package.describe({
  name: 'brettle:accounts-add-service',
  version: '0.1.0',
  summary: 'Allow users to add login services to their accounts',
  git: 'https://github.com/brettle/meteor-accounts-add-service.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('accounts-base');
  api.use('brettle:accounts-multiple@0.0.1', 'server');
  api.export('AccountsAddService');
  api.addFiles('accounts-add-service.js', 'server');
});

Package.onTest(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('tinytest');
  api.use('brettle:accounts-add-service@0.1.0');
  api.use('brettle:accounts-testing-support@0.1.0');
  api.use('brettle:accounts-multiple@0.1.0', 'server');
  api.use('accounts-base');
  api.addFiles('accounts-add-service-tests.js', 'server');
});
