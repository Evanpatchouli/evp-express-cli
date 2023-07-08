const dependencies = [
  'multer'
];

const bodyParser =
`const express = require('express');
const multer = require('multer');

const text = express.text({type: 'text'});
const jsonParser = express.json({type: 'application/json'});
const formParser = express.urlencoded({extended: false});
const formParserPlus = express.urlencoded({extended: true});
const multiParser = multer().any();

exports.Text = text;
exports.Json = jsonParser;
exports.Form = formParser;
exports.FromPlus = formParserPlus;
exports.Multi = multiParser;
`;

module.exports = {
  dependencies,
  name: 'src/midwares/bodyParser.js',
  content: bodyParser
}