const configYaml = `nacos:
  server:
    host: 127.0.0.1
    port: 8848
  namespace: public
`;

const source = `const { NacosNamingClient } = require('nacos');
const config = require('../config').get();
const logger = require('./logger');

function makeClient() {
    const options = config.nacos;
    const client = new NacosNamingClient({
        logger: console,
        serverList: options.server.host + ':' + options.server.port,
        namespace: options.namespace
    });
    return { client };
}
let proxy;
let startup;
function current() {
    if (!proxy)
        proxy = makeClient();
    return proxy;
}
async function register() {
    const instance = current();
    await instance.client.ready();
    await instance.client.registerInstance(config.app.name, {
        ip: config.app.host, port: Number(config.app.port),
        instanceId: config.app.name + '@' + config.app.host + ':' + config.app.port,
        healthy: true, enabled: true
    });
    return instance;
}
function init() {
    if (!startup) {
        startup = register().catch(err => {
            startup = undefined;
            throw err;
        });
    }
    return startup;
}
const api = {
    init,
    get instance() {
        void init().catch(err => logger.error(err));
        return current();
    }
};

module.exports = api;
`;

module.exports = {
  configYaml,
  files: [
    { name: "src/utils/nacosProxy.js", content: source }
  ],
  dependencies: ["nacos@2"],
  initSegments: ["await require('./utils/nacosProxy').init();"]
};
