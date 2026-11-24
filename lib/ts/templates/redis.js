const configYaml = `redis:
  host: 127.0.0.1
  port: 6379
  password: ""
`;

const source = `import { createClient } from 'redis';
import Config from '../config';
import logger from './logger';

const config: EvpConfig = Config.get();

interface RedisProxy {
  client: ReturnType<typeof createClient>;
}

function makeClient(): RedisProxy {
  const options = config.redis;
  const client = createClient({
    socket: {
      host: options.host,
      port: Number(options.port),
      reconnectStrategy: (retries: number) => retries >= 4 ? false : Math.min(100 * 2 ** retries, 1000)
    },
    ...(options.password ? { password: options.password } : {})
  });
  client.on('error', err => logger.error(err));
  client.on('end', () => { startup = undefined; });
  return { client };
}

let proxy: ReturnType<typeof makeClient> | undefined;
let startup: Promise<ReturnType<typeof makeClient>> | undefined;
function current() {
  if (!proxy) proxy = makeClient();
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

export default api;
`;

module.exports = {
  configYaml,
  files: [
    { name: "src/utils/redisProxy.ts", content: source }
  ],
  dependencies: ["redis@4"],
  importSegments: ["import RedisProxy from \"./utils/redisProxy\";"],
  initSegments: ["await RedisProxy.init();"]
};
