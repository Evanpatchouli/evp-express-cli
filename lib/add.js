const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prepareTemplate = require('./add-template');

const templates = ['validator', 'zod', 'database', 'redis', 'auth', 'rabbitmq', 'websocket', 'socketio', 'nacos'];
const devtools = ['jest', 'pkg', 'pm2', 'eslint', 'babel'];

function install(specifications, cwd) {
  for (const specification of specifications) {
    execSync('npm install ' + specification, { cwd, stdio: 'inherit' });
  }
}

module.exports = function add(name, languageRoot = __dirname, installPackages = install) {
  const isTool = devtools.includes(name);
  if (!isTool && !templates.includes(name)) throw new Error('Unknown template or tool: ' + name);
  const root = process.cwd();
  const descriptor = require(path.join(languageRoot, isTool ? 'devtools' : 'templates', name));
  const writeFiles = prepareTemplate(root, descriptor);
  installPackages(descriptor.dependencies || [], root);
  if (isTool) {
    const manifestPath = path.join(root, 'package.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    fs.writeFileSync(manifestPath, JSON.stringify(descriptor.updPkgJson(manifest), null, 2) + '\n');
  }
  writeFiles();
  console.log('Added ' + name);
  if (!isTool && descriptor.initSegments?.length) {
    console.log('Add the initialization call to src/init in your project.');
  }
};
