const dependencies = [
  'express-async-errors'
];

const exhandler =
`const Resp = require('../model/resp');
const logger = require('../utils/logger');

const exhandleStrategy = new Map();

exhandleStrategy.set(400, (res, ...args)=>{
  const [msg,symbol,data,status] = args;
  if (status) {
    res.status(status).json(Resp.fail(msg, symbol??-1, data??null));
  } else {
    res.json(Resp.fail(msg, symbol??-1, data??null));
  }
});

exhandleStrategy.set(500, (res, ...args)=>{
  const [msg,symbol,data,status] = args;
  if (status) {
    res.status(status).json(Resp.bad(msg));
  } else {
    res.json(Resp.bad(msg));
  }
})

module.exports = {
  excatcher: (err, req, res, next) => {
    if (err) {
      try {
        const payload = JSON.parse(err.message);
        const {code,msg,symbol,data,back,status} = payload;
        if (back != false) {
          const handler = exhandleStrategy.get(code);
          if ( handler ) { handler(res,msg,symbol,data,status); }
          else { res.json(Resp.bad("System Exception")); }
        } else {
          res.json(Resp.bad("System Exception"));
        }
      } catch (_) { // cannot be parsed to JSON object => common error
        res.json(Resp.bad("System Exception"));
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