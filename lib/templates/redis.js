const configYaml = `redis:
  host: 127.0.0.1
  port: 6379
  password: ""
`;

const source = `const { createClient } = require('redis');
const config = require('../config').get();
const logger = require('./logger');

function makeClient() {
    const options = config.redis;
    const client = createClient({
        socket: {
            host: options.host,
            port: Number(options.port),
            reconnectStrategy: (retries) => retries >= 4 ? false : Math.min(100 * 2 ** retries, 1000)
        },
        ...(options.password ? { password: options.password } : {})
    });
    client.on('error', err => logger.error(err));
    client.on('end', () => { startup = undefined; });
    return { client };
}
let proxy;
let startup;
function current() {
    if (!proxy)
        proxy = makeClient();
    return proxy;
}
function init() {
    const instance = current();
    if (!startup) {
        startup = instance.client.connect().then(() => {
            logger.info('Redis connected');
            return instance;
        }).catch(err => {
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
    { name: "src/utils/redisProxy.js", content: source }
  ],
  dependencies: ["redis@4"],
  initSegments: ["await require('./utils/redisProxy').init();"]
};
