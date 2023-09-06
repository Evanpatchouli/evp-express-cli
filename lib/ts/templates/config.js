module.exports = {
  name: "src/config.ts",
  content:
`import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function init() {
  const config: EvpConfig = yaml.load(
    fs.readFileSync(
      path.join(__dirname, '../assets/config.yaml')
  ) as unknown as string) as EvpConfig;
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
  // @ts-ignore
  global.__config = config;
}

function get() {
  // @ts-ignore
  if(!global.__config) {
    init();
  }
  // @ts-ignore
  const config = global.__config;
  return config;
}

export = {
  get,
  init
}
`,
  files: [],
}