const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const yaml = require('js-yaml');
const template = require('../lib/templates/config');

test('get caches parsed config and init explicitly reloads it', () => {
  let reads = 0;
  const module = { exports: {} };
  const dependencies = {
    fs: { readFileSync() { reads++; return 'app: {name: demo, port: 8000}'; } },
    path, 'js-yaml': yaml
  };
  vm.runInNewContext(template.content, {
    module, global: {}, process: { env: {}, cwd: process.cwd }, __dirname,
    require: name => dependencies[name]
  });
  const first = module.exports.get();
  assert.equal(module.exports.get(), first);
  assert.equal(reads, 1);
  module.exports.init();
  assert.notEqual(module.exports.get(), first);
  assert.equal(reads, 2);
});
