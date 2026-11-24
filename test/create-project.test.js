const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { normalizeSelection, templates, devtools } = require('../lib/registry');

test('All includes Zod and exactly one real-time transport', () => {
  for (const transport of ['websocket', 'socketio']) {
    const names = normalizeSelection(['All'], templates, transport);
    assert.ok(names.includes('zod'));
    assert.deepEqual(names.filter(n => ['websocket', 'socketio'].includes(n)), [transport]);
  }
  assert.deepEqual(normalizeSelection(['All'], devtools), devtools);
  assert.throws(() => normalizeSelection(['None', 'database'], templates));
  assert.throws(() => normalizeSelection(['websocket', 'socketio'], templates));
});

test('creation installs one complete manifest and can retry a failed install', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-create-'));
  const previous = process.cwd();
  const options = { name: 'service', host: '127.0.0.1', port: 0, logLevel: 'INFO', templates: ['All'], devtools: [] };
  let calls = 0;
  const create = require('../lib/create-project');
  try {
    process.chdir(root);
    assert.throws(() => create(options, true, () => { throw Error('offline'); }), /offline/);
    assert.deepEqual(fs.readdirSync(root), []);
    create(options, true, cwd => {
      calls++;
      const manifest = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));
      assert.match(manifest.dependencies.express, /4\./);
      assert.match(manifest.devDependencies.typescript, /4\.9/);
      assert.ok(manifest.dependencies.zod);
      assert.ok(!manifest.dependencies['socket.io']);
    });
    assert.equal(calls, 1);
    assert.ok(fs.existsSync(path.join(root, 'service/src/utils/nacosProxy.ts')));
    assert.throws(() => create(options, true), /already exists/);
  } finally {
    process.chdir(previous);
    fs.rmSync(root, { recursive: true, force: true });
  }
});
