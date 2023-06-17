const app =
`const express = require('express');
const index = require('./router/index.js');

const app = express();

app.use('/', index);

module.exports = app;
`;

module.exports = {
  name: 'app.js',
  content: app
}