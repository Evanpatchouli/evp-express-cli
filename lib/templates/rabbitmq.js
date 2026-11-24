const configYaml = `rabbitmq:
  host: 127.0.0.1
  port: 5672
  user: guest
  password: guest
`;

const source = `const amqplib = require('amqplib');
const config = require('../config').get();
const logger = require('./logger');

async function connect() {
    const options = config.rabbitmq;
    const conn = await amqplib.connect({
        username: options.user, password: options.password,
        hostname: options.host, port: Number(options.port)
    });
    conn.on('error', err => logger.error(err));
    try {
        const channel = await conn.createChannel();
        channel.on('error', err => logger.error(err));
        logger.info('RabbitMQ connected');
        return { conn, channel };
    }
    catch (err) {
        await conn.close().catch(closeErr => logger.error(closeErr));
        throw err;
    }
}
let startup;
function init() {
    if (!startup) {
        const attempt = connect().then(instance => {
            const reset = () => { if (startup === attempt)
                startup = undefined; };
            instance.conn.once('close', reset);
            instance.channel.once('close', () => {
                reset();
                void instance.conn.close().catch(err => logger.error(err));
            });
            return instance;
        }).catch(err => {
            startup = undefined;
            throw err;
        });
        startup = attempt;
    }
    return startup;
}
const api = { init, get instance() { return init(); } };

module.exports = api;
`;

module.exports = {
  configYaml,
  files: [
    { name: "src/utils/rabbitmqProxy.js", content: source }
  ],
  dependencies: ["amqplib@0.10"],
  initSegments: ["await require('./utils/rabbitmqProxy').init();"]
};
