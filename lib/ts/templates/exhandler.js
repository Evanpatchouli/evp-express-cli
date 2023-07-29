const dependencies = [
  'express-async-errors'
];

const exhandler =
`import Resp from "../model/resp";
import Express from 'express';
import logger from '../utils/logger';
import { Level } from "log4js";

const exhandleStrategy = new Map<number, Function>();

exhandleStrategy.set(400, (res: Express.Response, ...args: ErrorStrategyArgs)=>{
  const [msg,symbol,data,status] = args;
  if (status) {
    res.status(status).json(Resp.fail(msg, symbol, data));
  } else {
    res.json(Resp.fail(msg, symbol, data));
  }
});

exhandleStrategy.set(500, (res: Express.Response, ...args: ErrorStrategyArgs)=>{
  const [msg,symbol,data,status] = args;
  if (status) {
    res.status(status).json(Resp.bad(msg));
  } else {
    res.json(Resp.bad(msg));
  }
})

export const excatcher: EvpErrorHandler = (err, req, res, next) => {
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
}

export const exlogger: EvpErrorHandler = (err,req,res,next)=>{
  const level = logger.level as Level;
  if ( level.level <= 10000) {
    logger.error(err);
    return;
  }
  logger.error(err.message);
}

export default {
  excatcher,
  exlogger
}
`;

const files = [
  {
    name: 'src/midwares/exhandler.ts',
    content: exhandler
  }
];

module.exports = {
  dependencies,
  files,
  importSegments: [],
  initSegments: []
}