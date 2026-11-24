const configYaml = `database:
  client: mysql2
  host: localhost
  port: 3306
  user: root
  password: root
  database: example
  init:
    mode: always
    schema: \${assets}/schema.sql
    data: \${assets}/data.sql
`;

const source = `import { promises as fs } from 'fs';
import knex from 'knex';
import * as mysql from 'mysql2/promise';
import Config from '../config';
import logger from './logger';

const config: EvpConfig = Config.get();

const db = config.database;
const connection = {
  host: db.host, port: db.port, user: db.user,
  password: db.password, database: db.database
};
const sqlClient = knex({ client: db.client, connection });

async function runSql(script: string): Promise<unknown[]> {
  // Ignore a file containing only ordinary comments or empty statements.
  // Preserve executable MySQL comments and pass the original SQL to the driver.
  const leadingTrivia = /^(?:[\\s;]+|--(?=\\s|$)[^\\r\\n]*|#[^\\r\\n]*|\\/\\*(?![!+])[\\s\\S]*?\\*\\/)+/;
  if (!script.replace(leadingTrivia, '').trim()) return [];

  if (db.client !== 'mysql' && db.client !== 'mysql2') {
    // Other Knex dialects retain their own native script and result semantics.
    return [await sqlClient.raw(script)];
  }
  // Only trusted local bootstrap SQL belongs here. The application pool keeps
  // multipleStatements disabled. Send the whole file so the server parses SQL.
  const session = await mysql.createConnection({ ...connection, multipleStatements: true });
  try {
    const [rows, fields] = await session.query(script);
    // mysql2 returns one field-list for a single SELECT, and one field-list or
    // undefined per statement for a batch. A single DDL returns no field-list.
    const batch = Array.isArray(fields) && fields.length > 0 &&
      (fields[0] === undefined || Array.isArray(fields[0]));
    const results = batch && Array.isArray(rows) ? rows : [rows];
    await session.end();
    return results;
  } catch (err) {
    session.destroy();
    throw err;
  }
}

async function runSqlFile(filename: string) {
  return runSql(await fs.readFile(filename, 'utf8'));
}

let startup: Promise<void> | undefined;
async function initialize() {
  const options = db.init;
  if (options.mode !== 'always') return;
  if (options.schema) await runSqlFile(options.schema);
  if (options.data) await runSqlFile(options.data);
  logger.info('Database initialized');
}

function init() {
  if (!startup) {
    startup = initialize().catch(err => {
      startup = undefined;
      throw err;
    });
  }
  return startup;
}

const api = { sqlClient, runSql, runSqlFile, init };

export default api;
`;

module.exports = {
  configYaml,
  files: [
    { name: "src/utils/knex.ts", content: source },
    {"name":"assets/schema.sql","content":""},
    {"name":"assets/data.sql","content":""}
  ],
  dependencies: ["knex@3","mysql2@3"],
  importSegments: ["import Knex from \"./utils/knex\";"],
  initSegments: ["await Knex.init();"]
};
