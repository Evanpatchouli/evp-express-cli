const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('show lists the public templates and tools from any directory', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-show-'));
  try {
    const output = execFileSync(process.execPath, [path.resolve(__dirname, '../bin/cli'), 'show'], {
      cwd: directory, encoding: 'utf8'
    });
    for (const name of ['validator', 'zod', 'database', 'jest', 'eslint']) {
      assert.ok(output.trim().split(/\s+/).includes(name));
    }
    assert.deepEqual(fs.readdirSync(directory), []);
  } finally {
    fs.rmdirSync(directory);
  }
});
