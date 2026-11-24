const test = require('node:test');
const assert = require('node:assert/strict');
const { loadIntegration, deferred, nextTurn } = require('./helpers/integration');

test('database initialization waits for schema, passes complete SQL to mysql2 and then runs data', async () => {
  const schema = 'CREATE TABLE example (name VARCHAR(80));';
  const data = "/* ordinary comment */ INSERT INTO example VALUES ('spring;autumn');\n" +
    "-- second statement\nSELECT '#example';";
  const statements = [];
  const schemaGate = deferred();
  let closed = 0;
  const config = {
    database: { client: 'mysql2', init: { mode: 'always', schema: 'schema.sql', data: 'data.sql' } }
  };
  const database = loadIntegration('database', config, {
    knex(options) {
      assert.equal(options.connection.multipleStatements, undefined);
      return {};
    },
    fs: { promises: { readFile: async name => name === 'schema.sql' ? schema : data } },
    'mysql2/promise': {
      async createConnection(options) {
        assert.equal(options.multipleStatements, true);
        return {
          async query(sql) {
            statements.push(sql);
            if (sql === schema) {
              await schemaGate.promise;
              return [{ affectedRows: 0 }, undefined];
            }
            return [[{ affectedRows: 1 }, [{ value: '#example' }]], [undefined, [{}]]];
          },
          async end() { closed++; },
          destroy() { assert.fail('a successful session should close normally'); }
        };
      }
    }
  });

  let ready = false;
  const startup = database.init().then(() => { ready = true; });
  const second = database.init();
  await nextTurn();
  assert.deepEqual(statements, [schema]);
  assert.equal(ready, false);

  schemaGate.resolve();
  await Promise.all([startup, second]);
  assert.deepEqual(statements, [schema, data]);
  assert.equal(closed, 2);

  const results = await database.runSql(data);
  assert.equal(results.length, 2);
  assert.equal(results[1][0].value, '#example');
  assert.equal((await database.runSql(' -- comment\n /* comment */ ; ')).length, 0);
  assert.equal(statements.length, 3);
});

test('database initialization rejects on a failed schema and can be retried without running data early', async () => {
  const seen = [];
  let fail = true;
  let destroyed = 0;
  const config = {
    database: { client: 'mysql2', init: { mode: 'always', schema: 'schema', data: 'data' } }
  };
  const database = loadIntegration('database', config, {
    knex: () => ({}),
    fs: { promises: { readFile: async name => name } },
    'mysql2/promise': {
      async createConnection() {
        return {
          async query(sql) {
            seen.push(sql);
            if (fail) throw new Error('schema failed');
            return [{}, undefined];
          },
          async end() {},
          destroy() { destroyed++; }
        };
      }
    }
  });

  await assert.rejects(database.init(), /schema failed/);
  assert.deepEqual(seen, ['schema']);
  assert.equal(destroyed, 1);
  fail = false;
  await database.init();
  assert.deepEqual(seen, ['schema', 'schema', 'data']);
});
