module.exports = {
  name: "src/config.js",
  content:
`module.exports = {
  get,
  init
}

/**
 * @typedef {{
 * app:{name,host:string,port:number},
 * assets:string,
 * public:string,
 * private:string,
 * log4js:{level:string},
 * database:{
 * host:string;port:number;client:string;driver:string;database:string;user:string;password:string;
 * init:{mode:string,schema:string,data:string}},
 * redis:{host:string,port:string,password:string},
 * rabbitmq:{host:string,port:number,user:string,pass:string},
 * nacos:{server:{host:string,port:number},namespace:string}}} Config
 */

function init() {
  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');
  /**
   * @type {Config}
   */
  const config = yaml.load(
    fs.readFileSync(
      path.join(__dirname, '../assets/config.yaml')
  ));
  if (process.env.PORT) {
    config.app.port = parseInt(process.env.PORT);
  }
  config.assets = path.join(__dirname, '../assets');
  config.public = path.join(process.cwd(), 'public');
  config.private = path.join(process.cwd(), 'private');
  if (config.database) {
    let {client, database:db} = config.database;
    if (client == 'sqlite') {
      if (!path.isAbsolute(db)) {
        if (db.includes("\${private}")) {
          db = db.replace('\${private}','');
        }
        config.database.database = path.join(config.private, db);
      }
    }
    let schema = config.database.init.schema;
    if (schema && schema.trim() && !path.isAbsolute(schema)) {
      if (schema.includes("\${assets}")) {
        schema = schema.replace('\${assets}','');
      }
      config.database.init.schema = path.join(config.assets, schema);
    }
    let data = config.database.init.data;
    if (data && data.trim() && !path.isAbsolute(data)) {
      if (data.includes("\${assets}")) {
        data = data.replace('\${assets}','');
      }
      config.database.init.data = path.join(config.assets, data);
    }
  }
  global.__config = config;
}

function get() {
  if(!global.config) {
    init();
  }
  /**
   * @type {Config}
   */
  const config = global.__config;
  return config;
}
`,
  files: [],
}