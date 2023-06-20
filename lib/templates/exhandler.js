const dependencies = [
  'express-async-errors'
];

const exhandler =
`const Resp = require('../model/resp');
const logger = require('../utils/logger');

module.exports = {
  excatcher: (err, req, res, next) => {
    if (err) {
      if(err.type == 'fail'){
        res.json(Resp.fail(err.message, err.symbol??-1, err.data??null));
      } else {
        res.json(Resp.bad(err.message));
      }
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
}
`;

const files = [
  {
    name: 'src/midwares/exhandler.js',
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