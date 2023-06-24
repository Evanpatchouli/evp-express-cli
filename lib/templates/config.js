module.exports = {
  name: "src/config.js",
  content:
`module.exports = {
  get,
  init
}

function init() {
  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');
  /**
   * @typedef {Object} Config
   * @type {{app:{name,host:string,port:number},assets:string,public:string,log4js:{level:string},database:{client:string,driver:string,database:string,init:{mode:string,schema:string,data:string}},redis:{host:string,port:string,password:string},rabbitmq:{host:string,port:number,user:string,pass:string},nacos:{server:{host:string,port:number},namespace:string}}}
   */
  const config = yaml.load(
    fs.readFileSync(
      path.join(__dirname, 'assets/config.yaml')
  ));
  config.assets = path.join(__dirname, 'assets');
  config.public = path.join(process.cwd(), 'public');
  if (config.database) {
    let {client, database:db} = config.database;
    if (client == 'sqlite) {
      if (!path.isAbsolute(db) {
        if (db.includes("\${public}")) {
          db = db.replace('\${public}','');
        }
        config.database.database = path.join(config.public, db);
      }
    }
    let schema = config.database.init.schema;
    if (!path.isAbsolute(schema)) {
      if (schema.includes("\${assets}")) {
        schema = schema.replace('\${assets}','');
      }
      config.database.init.schema = path.join(config.assets, schema);
    }
    let data = config.database.init.data;
    if (!path.isAbsolute(data)) {
      if (data.includes("\${assets}")) {
        data = data.replace('\${assets}','');
      }
      config.database.init.data = path.join(config.assets, data);
    }
  }
  global.__config = config;
}

function get() {
  if(!golobal.config) {
    init();
  }
  /**
   * @type {Config}
   */
  const config = global.config;
  return golobal.config;
}
`,
  files: [],
}