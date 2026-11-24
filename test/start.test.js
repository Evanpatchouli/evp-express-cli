const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

test('start runs compiled TypeScript and forwards stderr and exit code', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-start-'));
  try {
    fs.writeFileSync(path.join(root, 'evpconfig.json'), '{"lang":"TypeScript"}');
    fs.mkdirSync(path.join(root, 'dist'));
    fs.writeFileSync(path.join(root, 'dist/index.js'), 'console.error("app diagnostic"); process.exitCode = 7;');
    const child = spawnSync(process.execPath, [path.join(__dirname, '../bin/cli'), 'start'], { cwd: root, encoding: 'utf8' });
    assert.equal(child.status, 7);
    assert.match(child.stderr, /app diagnostic/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
