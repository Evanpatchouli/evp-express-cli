const test = require('node:test');
const assert = require('node:assert/strict');
const { files } = require('../lib/templates/zod');

function loadMiddleware() {
  const module = { exports: {} };
  const console = { log: () => assert.fail('Zod middleware logged a request') };
  new Function('module', 'console', files[0].content)(module, console);
  return module.exports.ZodValid;
}

test('Zod stores parsed sections after success and preserves input and other locals', () => {
  const validate = loadMiddleware();
  const req = { headers: { accept: 'test' }, params: { id: '7' }, query: {}, body: { name: ' demo ' } };
  const res = { locals: { marker: 1 } };
  const parse = fn => ({ safeParse: value => ({ success: true, data: fn(value) }) });
  const next = error => { assert.equal(error, undefined); };
  validate({ headers: parse(value => value.accept), params: parse(value => Number(value.id)) })(req, res, next);
  validate({ query: parse(() => ({ page: 1 })), body: parse(value => ({ name: value.name.trim() })) })(req, res, next);
  assert.deepEqual(res.locals, { marker: 1, validated: { headers: 'test', params: 7, query: { page: 1 }, body: { name: 'demo' } } });
  assert.deepEqual(req.params, { id: '7' });
  assert.deepEqual(req.query, {});
  assert.deepEqual(req.body, { name: ' demo ' });
});

test('Zod sends the first validation message without publishing partial results', () => {
  const validate = loadMiddleware();
  const res = { locals: { validated: { params: { id: 7 } } } };
  const schemas = {
    query: { safeParse: () => ({ success: true, data: { page: 1 } }) },
    body: { safeParse: () => ({ success: false, error: { issues: [{ message: 'name required' }, { message: 'other' }] } }) }
  };
  const calls = [];
  validate(schemas)({ query: {}, body: {} }, res, error => calls.push(error));
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0].message), { code: 400, msg: 'name required' });
  assert.deepEqual(res.locals.validated, { params: { id: 7 } });
});
