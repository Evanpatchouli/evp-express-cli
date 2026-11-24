const versions = {
  '@babel/cli': '^7.29.0',
  '@babel/core': '^7.29.0',
  '@babel/preset-env': '^7.29.0',
  '@types/amqplib': '^0.10.0',
  '@types/express': '^4.17.0',
  '@types/jest': '^29.5.0',
  '@types/js-yaml': '^4.0.0',
  '@types/multer': '^2.0.0',
  '@types/node': '16.18.126',
  '@types/ws': '^8.0.0',
  amqplib: '^0.10.9',
  eslint: '^8.57.1',
  'evp-express-cli': '^' + require('../package.json').version,
  express: '^4.21.0',
  'express-async-errors': '^3.1.1',
  'express-validator': '^7.0.1',
  jest: '^29.7.0',
  'js-text-chart': '^1.0.9',
  'js-yaml': '^4.1.0',
  knex: '^3.0.0',
  log4js: '^6.9.0',
  multer: '^2.0.2',
  mysql2: '^3.0.0',
  nacos: '^2.6.0',
  passport: '^0.7.0',
  pkg: '^5.8.1',
  pm2: '^5.4.3',
  redis: '^4.7.1',
  'socket.io': '^4.8.0',
  typescript: '~4.9.5',
  ws: '^8.0.0',
  zod: '~3.24.4'
};

// Template declarations are internal specifiers such as "@types/express@4 -D".
function applyDependencies(manifest, specs) {
  for (const spec of specs) {
    const match = /^((?:@[\w.-]+\/)?[\w.-]+)(?:@[^\s]+)?( -D)?$/.exec(spec);
    if (!match || !Object.hasOwn(versions, match[1])) {
      throw new Error(`Unknown template dependency: ${spec}`);
    }
    const [, name, isDev] = match;
    if (manifest.dependencies?.[name] || manifest.devDependencies?.[name]) continue;
    const key = isDev ? 'devDependencies' : 'dependencies';
    manifest[key] ??= {};
    manifest[key][name] = versions[name];
  }
  const dev = manifest.devDependencies || {};
  if (dev['evp-express-cli'] || dev.jest || dev['@babel/core']) {
    manifest.overrides ??= {};
    // Published 1.2.x releases allow Inquirer 8.2.7, whose editor requires Node 18.
    if (dev['evp-express-cli']) manifest.overrides['evp-express-cli'] ??= { inquirer: '8.2.6' };
    // These versions also satisfy the ranges declared by the preceding packages.
    if (dev.jest || dev['@babel/core']) {
      manifest.overrides['core-js-compat'] ??= '3.49.0';
      manifest.overrides.browserslist ??= '4.28.2';
      manifest.overrides['node-releases'] ??= '2.0.44';
    }
  }
  return manifest;
}

module.exports = { applyDependencies };
