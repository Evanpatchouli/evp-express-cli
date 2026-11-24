const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { loadIntegration, deferred, nextTurn } = require('./helpers/integration');

test('RabbitMQ shares a connection and publishes its proxy only after channel creation', async () => {
  const gate = deferred();
  const conn = new EventEmitter();
  const channel = new EventEmitter();
  conn.createChannel = () => gate.promise;
  let attempts = 0;
  const config = { rabbitmq: { host: 'localhost', port: 5672, user: 'guest', password: 'sample' } };
  const rabbit = loadIntegration('rabbitmq', config, {
    amqplib: {
      async connect(options) {
        attempts++;
        assert.equal(options.password, 'sample');
        return conn;
      }
    }
  });

  let ready = false;
  const first = rabbit.instance.then(proxy => { ready = true; return proxy; });
  const second = rabbit.init();
  await nextTurn();
  assert.equal(attempts, 1);
  assert.equal(ready, false);

  gate.resolve(channel);
  const proxy = await first;
  assert.equal(proxy.conn, conn);
  assert.equal(proxy.channel, channel);
  assert.equal(await second, proxy);
});

test('RabbitMQ closes a partial connection and retries after channel creation fails', async () => {
  let attempts = 0;
  let closes = 0;
  const channel = new EventEmitter();
  const rabbit = loadIntegration('rabbitmq', { rabbitmq: {} }, {
    amqplib: {
      async connect() {
        const conn = new EventEmitter();
        const attempt = ++attempts;
        conn.close = async () => { closes++; };
        conn.createChannel = async () => {
          if (attempt === 1) throw new Error('channel unavailable');
          return channel;
        };
        return conn;
      }
    }
  });

  await assert.rejects(rabbit.init(), /channel unavailable/);
  assert.equal(closes, 1);
  assert.equal((await rabbit.init()).channel, channel);
  assert.equal(attempts, 2);
});
