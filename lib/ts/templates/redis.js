const configYaml = 
`redis:
  host: 127.0.0.1
  port: 6379
  password: root
`;

const redisProxy =
`import Redis, {RedisClientType} from 'redis';
import logger from './logger';

class RedisProxy {
  static INSTANCE?: RedisProxy;
  client?: RedisClientType;
  constructor() {
    const client = Redis.createClient({
      url: \`redis://\${__config.redis.host}:\${__config.redis.port}\`,
      // password: \`\${__config.redis.password}\`
    });
    client.on('error', err => {
      logger.error('Redis Client Error!', err);
      process.exit(1);
    });
    
    client.connect().then(()=>{
      logger.info('Redis connected!');
    });
    this.client = client as RedisClientType
  }

  static instance() {
    if(!this.INSTANCE) {
      this.INSTANCE = new RedisProxy();
    }
    return this.INSTANCE;
  }
}

async function init() {
  return RedisProxy.instance();
}

export = {
  init,
  instance: RedisProxy.instance(),
};
`

const files = [
  {
    name: 'src/utils/redisProxy.ts',
    content: redisProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "redis"
  ],
  importSegments: [
    `import RedisProxy from './utils/redisProxy';`
  ],
  initSegments: [
    `await RedisProxy.init();`
  ]
}