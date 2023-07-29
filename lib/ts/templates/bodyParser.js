const dependencies = [
  'multer', "@types/multer -D"
];

const bodyParser =
`import express from 'express'
import multer from 'multer';

const text = express.text({type: 'text'});
const jsonParser = express.json({type: 'application/json'});
const formParser = express.urlencoded({extended: false});
const formParserPlus = express.urlencoded({extended: true});
const multiParser = multer().any();

export const Text = text;
export const Json = jsonParser;
export const Form = formParser;
export const FromPlus = formParserPlus;
export const Multi = multiParser;

`;

module.exports = {
  dependencies,
  name: 'src/midwares/bodyParser.ts',
  content: bodyParser
}