const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const prepare = require('../lib/add-template');

for (const lang of ['../lib', '../lib/ts']) {
  test(lang + ' preserves edited files and configuration when adding database twice', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-add-'));
    try {
      const cfg = path.join(root, 'assets/config.yaml');
      fs.mkdirSync(path.dirname(cfg));
      fs.writeFileSync(cfg, '# my settings\napp: {name: demo}\n');
      const template = require(lang + '/templates/database');
      prepare(root, template)();
      const sql = path.join(root, 'assets/schema.sql');
      fs.writeFileSync(sql, 'SELECT 1;');
      const original = fs.readFileSync(cfg, 'utf8').replace('localhost', 'my-db');
      fs.writeFileSync(cfg, original);
      prepare(root, template)();
      assert.equal(fs.readFileSync(sql, 'utf8'), 'SELECT 1;');
      assert.equal(fs.readFileSync(cfg, 'utf8'), original);
      assert.equal(yaml.load(original).database.host, 'my-db');
      fs.writeFileSync(cfg, 'bad: [');
      assert.throws(() => prepare(root, template));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
