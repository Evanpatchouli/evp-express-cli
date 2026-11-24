const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prepareTemplate = require('./add-template');
const { templates, devtools } = require('./registry');
const { applyDependencies } = require('./dependencies');

function install(cwd) {
  execSync('npm install', { cwd, stdio: 'inherit' });
}

function add(name, languageRoot, installPackages) {
  const isTool = devtools.includes(name);
  if (!isTool && !templates.includes(name)) throw new Error('Unknown template or tool: ' + name);
  const root = process.cwd();
  const other = name === 'websocket' ? 'socketio' : name === 'socketio' ? 'websocket' : undefined;
  if (other && require(path.join(languageRoot, 'templates', other)).files.some(file => fs.existsSync(path.join(root, file.name)))) {
    throw new Error('This project already includes ' + other + '. Choose one real-time transport.');
  }
  const descriptor = require(path.join(languageRoot, isTool ? 'devtools' : 'templates', name));
  const writeFiles = prepareTemplate(root, descriptor);
  const manifestPath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const original = fs.readFileSync(manifestPath);
  const previousLock = fs.existsSync(lockPath) ? fs.readFileSync(lockPath) : undefined;
  const manifest = JSON.parse(original);
  if (isTool) {
    manifest.scripts ??= {};
    descriptor.updPkgJson(manifest);
  }
  applyDependencies(manifest, descriptor.dependencies || []);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  try {
    installPackages(root);
  } catch (error) {
    fs.writeFileSync(manifestPath, original);
    if (previousLock) fs.writeFileSync(lockPath, previousLock);
    else fs.rmSync(lockPath, { force: true });
    throw error;
  }
  writeFiles();
  console.log('Added ' + name);
  if (!isTool && descriptor.initSegments?.length) {
    console.log('Add the initialization call to src/init in your project.');
  }
}

module.exports = function addToProject(name, languageRoot = __dirname, installPackages = install) {
  const lock = path.join(process.cwd(), '.evp-add.lock');
  try {
    fs.writeFileSync(lock, String(process.pid), { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    throw new Error('Another add owns .evp-add.lock. If it was interrupted, check its PID before removing the lock.');
  }
  try {
    return add(name, languageRoot, installPackages);
  } finally {
    fs.unlinkSync(lock);
  }
};
