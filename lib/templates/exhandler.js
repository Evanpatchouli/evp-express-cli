const dependencies = [
  'express-async-errors'
];

const exhandler =
`const Resp = require('../model/resp');
const logger = require('../utils/logger');

module.exports = {
  excatcher: (err, req, res, next) => {
    if (err) {
      res.json(Resp.bad(err.message));
      next(err);
    } else {
      next();
    }
  },

  exlogger: (err,req,res,next)=>{
    if (logger.level.level <= 10000) {
      logger.error(err);
      return;
    }
    logger.error(err.message);
  }
}`;

const files = [
  {
    name: 'midwares/exhandler.js',
    content: exhandler
  }
];

module.exports = {
  dependencies,
  files,
  initSegments: [
    `require('express-async-errors');`
  ]
}