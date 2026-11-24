const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

function loadTemplate(name, imports) {
  const module = { exports: {} };
  vm.runInNewContext(require('../lib/templates/' + name).files[0].content, {
    module, require(id) { return imports[id] || require(id); }
  });
  return module.exports;
}

test('ValidRace only passes after every chain succeeds, including an empty list', async () => {
  const { ValidRace } = loadTemplate('validator', { 'express-validator': {} });
  const empty = { array: () => [] };
  const finished = {};
  const delayed = new Promise(resolve => { finished.resolve = resolve; });
  const check = ValidRace([{ run: async () => empty }, { run: () => delayed }]);
  let passed = false;
  const result = new Promise(resolve => check({}, {}, error => { passed = true; resolve(error); }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(passed, false);
  finished.resolve({ array: () => [{ msg: 'required' }] });
  assert.equal(JSON.parse((await result).message).msg, 'required');
  await new Promise((resolve, reject) => ValidRace([])({}, {}, err => err ? reject(err) : resolve()));
});

test('error handler preserves business status and delegates once headers have been sent', () => {
  const Resp = { fail: (msg, symbol, data) => ({ msg, symbol, data }), bad: msg => ({ msg }) };
  const { excatcher } = loadTemplate('exhandler', { '../model/resp': Resp, '../utils/logger': {} });
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  const error = new Error(JSON.stringify({ code: 400, msg: 'missing', status: 422 }));
  excatcher(error, {}, res, assert.fail);
  assert.equal(res.code, 422);
  assert.equal(res.body.msg, 'missing');
  excatcher(error, {}, { headersSent: true }, value => assert.equal(value, error));
});
