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
    add('eslint', path.join(__dirname, '../lib'), (specs) => {
      assert.ok(specs[0].includes('eslint'));
      fs.writeFileSync('package.json', JSON.stringify({ ...manifest, devDependencies: { eslint: '^8' } }));
    });
    const saved = JSON.parse(fs.readFileSync('package.json'));
    assert.deepEqual(saved, { ...manifest, devDependencies: { eslint: '^8' } });
  } finally {
    process.chdir(previous);
    fs.rmSync(root, { recursive: true, force: true });
  }
});
