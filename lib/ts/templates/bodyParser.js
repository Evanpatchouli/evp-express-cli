const bodyParser = `import express from 'express';
import multer from 'multer';

const defaultLimits = {
  fileSize: 5 * 1024 * 1024,
  files: 4,
  fieldSize: 64 * 1024,
  fields: 32,
  parts: 36
};

export function MultiFields(fields: multer.Field[], limits: NonNullable<multer.Options['limits']> = {}) {
  const effectiveLimits = { ...defaultLimits, ...limits };
  for (const [name, value] of Object.entries(effectiveLimits)) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
      throw new RangeError('Multipart limit ' + name + ' must be a nonnegative safe integer');
    }
  }
  return multer({ limits: effectiveLimits }).fields(fields);
}

export const Text = express.text({type: 'text'});
export const Json = express.json({type: 'application/json'});
export const Form = express.urlencoded({extended: false});
export const FromPlus = express.urlencoded({extended: true});
export const Multi = multer({ limits: defaultLimits }).any();
`;

module.exports = {
  dependencies: ['multer', '@types/multer -D'],
  name: 'src/midwares/bodyParser.ts',
  content: bodyParser
};
