const configYaml = 
`rabbitmq:
  host: 127.0.0.1
  port: 5672
  user: guest
  password: guest
`;

const rabbitmqProxy =
`const config = require('../config').get();
const amqplib = require('amqplib');
const logger = require('./logger');

class RabbitmqProxy {
  /**@type {RabbitmqProxy}*/
  _instance = null;
  /**@type {amqplib.Connection}*/
  conn;
  /**@type {amqplib.Channel}*/
  channel;

  static async instance() {
    if (!this._instance) {
      let ins = new RabbitmqProxy();
      const conn = await amqplib.connect({
        username: \`\${config.rabbitmq.user}\`,
        password: \`\${config.rabbitmq.password}\`,
        hostname: \`\${config.rabbitmq.host}\`,
        port: \`\${config.rabbitmq.port}\`,
      });
      if(!this._instance){
        this._instance = ins;
        logger.info("Connected to RabbitMQ!");
        ins.conn = conn;
        const channel = await ins.conn.createChannel();
        ins.channel = channel;
      }
    }
    return this._instance;
  }
}

async function init() {
  return RabbitmqProxy.instance();
}

module.exports = {
  init,
  /**
   * ### Notice that it is a promise, when imported anywhere else please await in async funtion or then-flow to initialize a var of its instance.
   * \`\`\`javascript
   * const { instance } = require('../utils/rabbitmqProxy');
   * 
   * app.get('/', async(req, res)=>{
   *  const rbmqProxy = await instance;
   *  const { channel: rbmq } = rbmqProxy;
   *  rbmq.sendToQueue("queue", "hello");
   * })
   * \`\`\`
   * ---
   * ### Or like this:
   * \`\`\`javascript
   * const RabbitmqProxy = require('../utils/rabbitmqProxy');
   * 
   * app.get('/', async(req, res)=>{
   *  const rbmqProxy = await RabbitmqProxy.instance;
   *  const { channel: rbmq } = rbmqProxy;
   *  rbmq.sendToQueue("queue", "hello");
   * })
   * \`\`\`
   * ---
   * ### Or like this:
   * \`\`\`javascript
   * const amqplib = require('amqplib');
   * const RabbitmqProxy = require('../utils/rabbitmqProxy');
   * 
   * //@type {amqplib.Channel}
   * let rbmq = null;
   * RabbitmqProxy.instance.then(rabbitmq=>{
   *   rbmq = rabbitmq.channel;
   * })
   * 
   * app.get('/', async(req, res)=>{
   *  rbmq.sendToQueue("queue", "hello");
   * })
   * \`\`\`
   */
  instance: RabbitmqProxy.instance()
}
`;

const files = [
  {
    name: 'src/utils/rabbitmqProxy.js',
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
    `await require('./utils/rabbitmqProxy').init();`
  ]
}