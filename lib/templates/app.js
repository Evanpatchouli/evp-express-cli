const app =
`require('express-async-errors');
const express = require('express');
const index = require('./router/index.js');
const {excatcher,exlogger} = require('./midwares/exhandler');

const app = express();

app.use('/', index);

app.use(exlogger);
app.use(excatcher);

module.exports = app;

`;

module.exports = {
  name: 'src/app.js',
  content: app
}
