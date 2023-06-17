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
    data: ''
`;

const sqlClient =
`const fs = require('fs');
const knex = require('knex').default;
const logger = require('./logger');
const sqlClient = knex({
  client: __config.database.client,
  version: '5.7',
  connection: {
      host: \`\${__config.database.host}\`,
      port: __config.database.port,
      user: \`\${__config.database.user}\`,
      password: \`\${__config.database.password}\`,
      database: \`\${__config.database.database}\`
  }
});

function runSql(path) {
  const script = fs.readFileSync(path).toString();
  logger.info("Going to run a sql file:");
  logger.info(script);
  /**
   * 拆成一句句sql来执行是因为，knex执行一串语句时，会把它们都算进一个事务内
   * 忽略注释
   * 去首尾空格
   * 按冒号分句
   * 校验字串是否为sql语句
   * @type {string[]}
   */
  const sqls = script.replace(/\\/\\*[\\s\\S]*?\\*\\/|(--|\\#)[^\\r\\n]*/gm, '').trim().replaceAll('\\r','').split(';').filter(str=>{
      return str.trim() ? true : false;
  });
//   console.log("sqls");
//   console.log(sqls);
//   console.log("start run:");
  const promises = sqls.map(sql=>{
      sql += ';';  // knex会自动补上冒号，加不加无所谓其实
    //   console.log("Going to run a sql:");
    //   console.log(sql);
      return sqlClient.raw(sql);
  })
  return promises;
}

async function init() {
  if(__config.database.init.mode=='always') {
    const promises = runSql(\`\${__config.database.init.schema}\`);
    Promise.all(promises)
        .then(res=>{
          logger.info("Database inits successfully!")
        }).catch(err=>{
          logger.error(err);
    })
  }
};

module.exports = {
  runSql,
  sqlClient,
  init
}
`

const files = [
  {
    name: 'utils/knex.js',
    content: sqlClient
  },
  {
    name: 'assets/schema.sql',
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
    `await require('./${files[0].name}').init();`
  ]
}