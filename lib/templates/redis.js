const configYaml = 
`redis:
  host: 127.0.0.1
  port: 6379
  password: root
`;

const redisProxy =
`const Redis = require('redis');
const logger = require('./logger');

class RedisProxy {
  /**
  * @type {RedisProxy}
  */
  _instance = null;
  constructor() {
    const client = Redis.createClient({
      url: \`redis://\${__config.redis.host}:\${__config.redis.port}\`,
      // password: \`\${__config.redis.password}\`
    });
  
    client.on('connect', () => {
      logger.info('Redis connected!');
    });
    
    client.on('error', err => {
      logger.error('Redis Client Error!', err);
      process.exit(1);
    });

    client.connect();
    this.client = client
  }

  static instance() {
    if(!this._instance) {
      this._instance = new RedisProxy();
    }
    return this._instance;
  }
}

async function init() {
  return RedisProxy.instance();
}

module.exports = {
  init,
  instance: RedisProxy.instance(),
};
`

const files = [
  {
    name: 'utils/redisProxy.js',
    content: redisProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "redis"
  ],
  initSegments: [
    `await require('./${files[0].name}').init();`
  ]
}