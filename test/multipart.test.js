const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../lib/templates/bodyParser');

function loadParser() {
  const exports = {};
  const express = { text() {}, json() {}, urlencoded() {} };
  const multer = ({ limits }) => ({
    any: () => ({ mode: 'any', limits }),
    fields: fields => ({ mode: 'fields', fields, limits })
  });
  new Function('require', 'exports', template.content)(name => ({ express, multer })[name], exports);
  return exports;
}

test('legacy Multi keeps its any-file interface and bounds files, text, and aggregate part count', () => {
  const { Multi } = loadParser();
  assert.equal(Multi.mode, 'any');
  for (const name of ['fileSize', 'files', 'fieldSize', 'fields', 'parts']) {
    assert.ok(Number.isSafeInteger(Multi.limits[name]) && Multi.limits[name] > 0, name);
  }
});

test('MultiFields uses its route field list and overrides only the specified limits', () => {
  const { Multi, MultiFields } = loadParser();
  const fields = [{ name: 'photo', maxCount: 1 }];
  const limited = MultiFields(fields, { fileSize: 1024, fields: 0 });
  assert.equal(limited.mode, 'fields');
  assert.deepEqual(limited.fields, fields);
  assert.deepEqual(limited.limits, { ...Multi.limits, fileSize: 1024, fields: 0 });
  assert.notEqual(Multi.limits.fileSize, limited.limits.fileSize);
  for (const bad of [Infinity, NaN, -1, 1.5, undefined]) {
    assert.throws(() => MultiFields(fields, { files: bad }), RangeError);
  }
});
