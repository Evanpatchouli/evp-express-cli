module.exports = {
  name: "src/config.js",
  content:
`module.exports = function() {
  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');
  /**
  * @type {{app:{name,host:string,port:number},log4js:{level:string},rabbitmq:{host:string,port:number,user:string,pass:string}}}
  */
  const config = yaml.load(
    fs.readFileSync(
      path.join(__dirname, 'assets/config.yaml')
  ));
  if (\`\${config.assets}\`.trim()=="default"){
    config.assets = "assets";
  }
  if (\`\${config.public}\`.trim()=="default"){
    config.public = path.join(process.cwd(), "public");
  }
  if (config.database) {
    let db_init_schema = \`\${config.database.init.schema}\`.trim();
    if (db_init_schema != '') {
      if (db_init_schema.includes('\${assets}')) {
          db_init_schema = db_init_schema.replace('\${assets}', config.assets);
          db_init_schema = path.join(__dirname, db_init_schema);
      }
      config.database.init.schema = db_init_schema;
    }
  }
  global.__config = config;
}
`,
  files: [],
}