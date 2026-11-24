const test = require('node:test');
const assert = require('node:assert/strict');
const { loadIntegration, deferred, nextTurn } = require('./helpers/integration');

function config() {
  return {
    app: { name: 'service', host: '127.0.0.1', port: 8080 },
    nacos: { server: { host: 'localhost', port: 8848 }, namespace: 'public' }
  };
}

test('Nacos waits for discovery readiness and for successful service registration', async () => {
  const readyGate = deferred();
  const registered = deferred();
  let registrations = 0;
  class Client {
    constructor(options) {
      assert.equal(options.serverList, 'localhost:8848');
      assert.equal(options.namespace, 'public');
    }
    ready() { return readyGate.promise; }
    registerInstance(service, instance) {
      assert.equal(service, 'service');
      assert.equal(instance.ip, '127.0.0.1');
      assert.equal(instance.port, 8080);
      registrations++;
      return registered.promise;
    }
  }

  const nacos = loadIntegration('nacos', config(), { nacos: { NacosNamingClient: Client } });
  let done = false;
  const startup = nacos.init().then(proxy => { done = true; return proxy; });
  const second = nacos.init();
  assert.ok(nacos.instance.client instanceof Client);
  assert.equal(registrations, 0);

  readyGate.resolve();
  await nextTurn();
  assert.equal(registrations, 1);
  assert.equal(done, false);

  registered.resolve();
  assert.equal((await startup).client, (await second).client);
});

test('Nacos propagates a registration error and allows another attempt', async () => {
  let attempts = 0;
  class Client {
    async ready() {}
    async registerInstance() {
      attempts++;
      if (attempts === 1) throw new Error('registration refused');
    }
  }
  const nacos = loadIntegration('nacos', config(), { nacos: { NacosNamingClient: Client } });

  await assert.rejects(nacos.init(), /registration refused/);
  assert.ok((await nacos.init()).client instanceof Client);
  assert.equal(attempts, 2);
});
