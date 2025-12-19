const configYaml = 
`database:
  client: mysql2
  host: localhost
  port: 3306
  user: root
  password: root
  database: example
  init:
    mode: always  # always, never
    schema: \${assets}/schema.sql
    data: \${assets}/data.sql
`;

const sqlClient =
`import fs from 'fs';
import knex from 'knex';
import logger from './logger';

const sqlClient = knex({
  client: __config.database.client,
  version: '5.7',
  connection: {
      host: __config.database.host,
      port: __config.database.port,
      user: __config.database.user,
      password: __config.database.password,
      database: __config.database.database
  }
});

/**
 * @type {string} script
*/
async function runSql(script: string) {
  logger.info("Going to run a sql script:");
  /**
   * Ignore comments
   * Remove blanks of head and tail
   * Split into separate sql by semicolon
   * check is it a real sql
   * @type {string[]}
   */
  const sqls: string[] = script.replace(/\\/\\*[\\s\\S]*?\\*\\/|(--|\\#)[^\\r\\n]*/gm, '').trim().replaceAll('\\r','').split(';').filter(str=>{
    return str.trim() ? true : false;
});
  let results = [];
  for(const sql of sqls){
    logger.debug(\`[SQL] \${sql};\`);
    const [result] = await sqlClient.raw(\`\${sql};\`);
    results.push(result);
  }
  return results;
}

async function runSqlFile(path: string) {
  const script = fs.readFileSync(path).toString();
  return await runSql(script);
}

async function init() {
  if(__config.database.init.mode=='always') {
    const schema = __config.database.init.schema;
    if(!schema) return;
    runSqlFile(schema)
      .then(res=>{
        const data = __config.database.init.data;
        if(!data) return;
        runSqlFile(data)
          .then(res=>{
            logger.info("Database inits successfully!")
          }).catch(err=>{
            logger.error(err);
            process.exit(1);
        })
      }).catch(err=>{
        logger.error(err);
        process.exit(1);
    })
  }
};

const database = {
  runSql,
  runSqlFile,
  sqlClient,
  init
}

export default database;
`

const files = [
  {
    name: 'src/utils/knex.ts',
    content: sqlClient
  },
  {
    name: 'assets/schema.sql',
    content: ""
  },
  {
    name: 'assets/data.sql',
    content: ""
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "knex", "mysql2"
  ],
  importSegments: [
    `import Knex from './utils/knex';`
  ],
  initSegments: [
    `await Knex.init();`
  ]
}