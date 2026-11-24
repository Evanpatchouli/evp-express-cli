const bodyParser = `const express = require('express');
const multer = require('multer');

const defaultLimits = {
  fileSize: 5 * 1024 * 1024,
  files: 4,
  fieldSize: 64 * 1024,
  fields: 32,
  parts: 36
};

function MultiFields(fields, limits = {}) {
  const effectiveLimits = { ...defaultLimits, ...limits };
  for (const [name, value] of Object.entries(effectiveLimits)) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
      throw new RangeError('Multipart limit ' + name + ' must be a nonnegative safe integer');
    }
  }
  return multer({ limits: effectiveLimits }).fields(fields);
}

exports.Text = express.text({type: 'text'});
exports.Json = express.json({type: 'application/json'});
exports.Form = express.urlencoded({extended: false});
exports.FromPlus = express.urlencoded({extended: true});
exports.Multi = multer({ limits: defaultLimits }).any();
exports.MultiFields = MultiFields;
`;

module.exports = {
  dependencies: ['multer'],
  name: 'src/midwares/bodyParser.js',
  content: bodyParser
};
