const configYaml = 
`rabbitmq:
  host: 127.0.0.1
  port: 5672
  user: guest
  password: guest
`;

const rabbitmqProxy =
`import amqplib from 'amqplib';
import logger from './logger';

class RabbitmqProxy {
  static INSTANCE?: RabbitmqProxy;
  conn?: amqplib.Connection;
  /**@type {amqplib.Channel}*/
  channel?: amqplib.Channel;

  static async instance() {
    if (!this.INSTANCE) {
      let ins = new RabbitmqProxy();
      const conn = await amqplib.connect({
        username: __config.rabbitmq.user,
        password: __config.rabbitmq.password,
        hostname: __config.rabbitmq.host,
        port: __config.rabbitmq.port,
      });
      if(!this.INSTANCE){
        this.INSTANCE = ins;
        logger.info("Connected to RabbitMQ!");
        ins.conn = conn;
        const channel = await ins.conn.createChannel();
        ins.channel = channel;
      }
    }
    return this.INSTANCE;
  }
}

async function init() {
  return RabbitmqProxy.instance();
}

const rabbitmqProxy = {
  init,
  /**
   * ### Notice that it is a promise, when imported anywhere else please await in async funtion or then-flow to initialize a var of its instance.
   * \`\`\`javascript
   * import { instance } from '../utils/rabbitmqProxy';
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
   * import RabbitmqProxy from '../utils/rabbitmqProxy';
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
   * import amqplib from 'amqplib';
   * import RabbitmqProxy from '../utils/rabbitmqProxy');
   * 
   * let rbmq: amqplib.Channel;
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

export default rabbitmqProxy;
`;

const files = [
  {
    name: 'src/utils/rabbitmqProxy.ts',
    content: rabbitmqProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "amqplib", "@types/amqplib -D"
  ],
  importSegments: [
    `import RabbitmqProxy from './utils/rabbitmqProxy';`
  ],
  initSegments: [
    `await RabbitmqProxy.init();`
  ]
}