const vm = require('node:vm');

function loadIntegration(name, config, drivers) {
  const template = require('../../lib/templates/' + name);
  const source = template.files.find(file => file.name.startsWith('src/utils/'));
  const imports = {
    '../config': { get: () => config },
    './logger': { info() {}, debug() {}, error() {} },
    ...drivers
  };
  const module = { exports: {} };
  vm.runInNewContext(source.content, {
    module,
    require(id) {
      if (!Object.hasOwn(imports, id)) throw new Error('Unexpected module: ' + id);
      return imports[id];
    }
  }, { filename: source.name });
  return module.exports;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function nextTurn() {
  return new Promise(resolve => setImmediate(resolve));
}

module.exports = { loadIntegration, deferred, nextTurn };
