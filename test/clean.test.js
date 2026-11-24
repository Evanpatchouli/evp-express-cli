const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const clean = require('../lib/clean');

test('clean removes only the chosen directory and unlinks directory links', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-clean-'));
  try {
    const target = path.join(root, 'generated');
    const kept = path.join(root, 'kept');
    fs.mkdirSync(target);
    fs.mkdirSync(kept);
    fs.writeFileSync(path.join(kept, 'file'), 'keep');
    fs.symlinkSync(kept, path.join(target, 'link'), 'junction');
    assert.throws(() => clean(root, '.'));
    assert.throws(() => clean(root, '..'));
    assert.throws(() => clean(root, 'missing'));
    clean(root, 'generated');
    assert.equal(fs.existsSync(target), false);
    assert.equal(fs.readFileSync(path.join(kept, 'file'), 'utf8'), 'keep');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
