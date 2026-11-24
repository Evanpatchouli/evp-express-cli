const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { loadIntegration, deferred, nextTurn } = require('./helpers/integration');

test('Redis shares initialization, applies credentials and waits for a connected client', async () => {
  const gate = deferred();
  const client = new EventEmitter();
  let connects = 0;
  client.connect = () => {
    connects++;
    return gate.promise;
  };

  const redis = loadIntegration('redis', { redis: { host: 'localhost', port: 6379, password: 'sample' } }, {
    redis: {
      createClient(options) {
        assert.equal(options.socket.host, 'localhost');
        assert.equal(options.socket.port, 6379);
        assert.equal(options.password, 'sample');
        return client;
      }
    }
  });

  let ready = false;
  const startup = redis.init().then(proxy => {
    ready = true;
    return proxy;
  });
  assert.equal(redis.instance.client, client);
  const second = redis.init();
  await nextTurn();
  assert.equal(connects, 1);
  assert.equal(ready, false);

  gate.resolve();
  assert.equal((await startup).client, client);
  assert.equal((await second).client, client);
});

test('Redis reports a connection failure and allows another initialization attempt', async () => {
  const client = new EventEmitter();
  let attempts = 0;
  client.connect = async () => {
    attempts++;
    if (attempts === 1) throw new Error('connection unavailable');
  };
  const redis = loadIntegration('redis', { redis: { host: 'localhost', port: 6379, password: '' } }, {
    redis: {
      createClient(options) {
        assert.equal(options.password, undefined);
        return client;
      }
    }
  });

  await assert.rejects(redis.init(), /connection unavailable/);
  assert.equal((await redis.init()).client, client);
  assert.equal(attempts, 2);
});
