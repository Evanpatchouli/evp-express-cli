const configYaml = 
`rabbitmq:
  host: 127.0.0.1
  port: 5672
  user: guest
  password: guest
`;

const rabbitmqProxy =
`const amqplib = require('amqplib');
const logger = require('./logger');

class RabbitmqProxy {
  /**
   * @type {RabbitmqProxy}
   */
  _instance = null;
  constructor() {
    amqplib.connect(
      {
        username: \`\${__config.rabbitmq.user}\`,
        password: \`\${__config.rabbitmq.password}\`,
        hostname: \`\${__config.rabbitmq.host}\`,
        port: \`\${__config.rabbitmq.port}\`
      }).then(conn=>{
        logger.info('Connected to RabbitMQ!');
        this.conn = conn;
        this.conn.createChannel().then(channel=>{
          this.channel = channel;
        });
      });
  }

  static instance() {
    if(!this._instance) {
      this._instance = new RabbitmqProxy();
    }
    return this._instance;
  }
}

async function init() {
  return RabbitmqProxy.instance();
}

module.exports = {
  init,
  rabbitmqProxy: RabbitmqProxy.instance()
}
`;

const files = [
  {
    name: 'utils/rabbitmqProxy.js',
    content: rabbitmqProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "amqplib"
  ],
  initSegments: [
    `await require('./${files[0].name}').init();`
  ]
}