const content = `const Resp = require('../model/resp');
const logger = require('../utils/logger');

function excatcher(err, req, res, next) {
  if (res.headersSent) return next(err);
  let payload;
  try {
    payload = JSON.parse(err.message);
  } catch {
    // Ordinary errors keep the public system message.
  }
  if (!payload || payload.back === false || ![400, 500].includes(payload.code)) {
    res.json(Resp.bad('System Exception'));
    return;
  }
  if (Number.isInteger(payload.status) && payload.status >= 100 && payload.status <= 599) {
    res.status(payload.status);
  }
  const body = payload.code === 400
    ? Resp.fail(payload.msg, payload.symbol ?? -1, payload.data ?? null)
    : Resp.bad(payload.msg);
  res.json(body);
}

function exlogger(err, req, res, next) {
  logger.error(err);
  next(err);
}

module.exports = { excatcher, exlogger };
`;

module.exports = {
  dependencies: ['express-async-errors'],
  files: [{ name: 'src/midwares/exhandler.js', content }],
  initSegments: []
};
