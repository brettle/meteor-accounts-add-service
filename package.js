Package.describe({
  name: 'brettle:accounts-add-service',
  version: '0.0.1',
  summary: 'Allow users to add login services to their accounts',
  git: ' git@github.com:brettle/meteor-accounts-multiple.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('accounts-base');
  api.use('brettle:accounts-multiple', 'server');
  api.addFiles('accounts-add-service.js', 'server');
});

Package.onTest(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('tinytest');
  api.use('brettle:accounts-add-service');
  api.use('accounts-base');
  api.addFiles('accounts-add-service-tests.js', 'server');
});
