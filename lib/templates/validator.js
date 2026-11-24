const content = `const validator = require('express-validator');

function failure(messages) {
  const detail = messages.map(String);
  return new Error(JSON.stringify({ code: 400, msg: detail.join('; '), data: detail.length > 1 ? detail : null }));
}

function check(run) {
  return (req, res, next) => { run(req).then(() => next(), next); };
}

function ValidRace(chains) {
  return check(async req => {
    await Promise.all(chains.map(async chain => {
      const [first] = (await chain.run(req)).array();
      if (first) throw failure([first.msg]);
    }));
  });
}

function ValidAll(chains) {
  return check(async req => {
    const results = await Promise.all(chains.map(chain => chain.run(req)));
    const errors = results.flatMap(result => result.array().map(error => error.msg));
    if (errors.length) throw failure(errors);
  });
}

function ValidQueue(chains) {
  return check(async req => {
    for (const chain of chains) {
      const [first] = (await chain.run(req)).array();
      if (first) throw failure([first.msg]);
    }
  });
}

function ValidQueueAll(chains) {
  return check(async req => {
    const errors = [];
    for (const chain of chains) {
      const result = await chain.run(req);
      errors.push(...result.array().map(error => error.msg));
    }
    if (errors.length) throw failure(errors);
  });
}

module.exports = { validator, ValidRace, ValidAll, ValidQueue, ValidQueueAll };
`;

module.exports = {
  dependencies: ['express-validator'],
  files: [{ name: 'src/midwares/valider.js', content }],
  initSegments: []
};
