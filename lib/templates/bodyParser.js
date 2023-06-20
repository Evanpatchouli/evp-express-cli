const dependencies = [
  'multer'
];

const bodyParser =
`// import * as bodyParser from 'body-parser';
const express = require('express');
const multer = require('multer');

// const jsonParser = bodyParser.json();
const jsonParser = express.json({type: 'application/json'});
const formParser = express.urlencoded({extended: false});
const formParserPlus = express.urlencoded({extended: true});
const multiParser = multer().any();

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