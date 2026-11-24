const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const add = require('../lib/add');

test('add eslint preserves installed packages, entries and user scripts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-tools-'));
  const previous = process.cwd();
  try {
    process.chdir(root);
    const manifest = { scripts: { test: 'node --test', build: 'custom' }, main: 'custom.js' };
    fs.writeFileSync('package.json', JSON.stringify(manifest));
    add('eslint', path.join(__dirname, '../lib'), () => {
      const installed = JSON.parse(fs.readFileSync('package.json'));
      assert.match(installed.devDependencies.eslint, /8\./);
      installed.description = 'preserved after installation';
      fs.writeFileSync('package.json', JSON.stringify(installed));
    });
    const saved = JSON.parse(fs.readFileSync('package.json'));
    assert.deepEqual(saved.scripts, manifest.scripts);
    assert.equal(saved.main, manifest.main);
    assert.equal(saved.bin, undefined);
    assert.equal(saved.description, 'preserved after installation');
    assert.match(saved.devDependencies.eslint, /8\./);
    const before = fs.readFileSync('package.json', 'utf8');
    assert.throws(() => add('jest', path.join(__dirname, '../lib'), () => { throw Error('install failed'); }));
    assert.equal(fs.readFileSync('package.json', 'utf8'), before);
    assert.equal(fs.existsSync('.evp-add.lock'), false);
    add('eslint', path.join(__dirname, '../lib'), () => {
      assert.throws(() => add('jest', path.join(__dirname, '../lib'), assert.fail), /Another add/);
    });
  } finally {
    process.chdir(previous);
    fs.rmSync(root, { recursive: true, force: true });
  }
});
