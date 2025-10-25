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
`const fs = require('fs');
const config = require('../config').get();
const knex = require('knex').default;
const logger = require('./logger');

const sqlClient = knex({
  client: config.database.client,
  version: '5.7',
  connection: {
      host: \`\${config.database.host}\`,
      port: config.database.port,
      user: \`\${config.database.user}\`,
      password: \`\${config.database.password}\`,
      database: \`\${config.database.database}\`
  }
});

/**
 * @type {string} script
*/
async function runSql(script) {
  logger.info("Going to run a sql script:");
  /**
   * Ignore comments
   * Remove blanks of head and tail
   * Split into separate sql by semicolon
   * check is it a real sql
   * @type {string[]}
   */
  const sqls = script.replace(/\\/\\*[\\s\\S]*?\\*\\/|(--|\\#)[^\\r\\n]*/gm, '').trim().replaceAll('\\r','').split(';').filter(str=>{
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

async function runSqlFile(path) {
  const script = fs.readFileSync(path).toString();
  return await runSql(script);
}

async function init() {
  if(config.database.init.mode=='always') {
    const schema = config.database.init.schema;
    if(!schema) return;
    runSqlFile(schema)
      .then(res=>{
        const data = config.database.init.data;
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

module.exports = {
  runSql,
  runSqlFile,
  sqlClient,
  init
}
`

const files = [
  {
    name: 'src/utils/knex.js',
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
  initSegments: [
    `await require('./utils/knex').init();`
  ]
}