const configYaml = 
`nacos:
  server:
    host: 127.0.0.1
    port: 8848
  namespace: public
`;

const nacosProxy =
`const config = require('../config').get();
const NacosNamingClient = require('nacos').NacosNamingClient;
const logger = require('./logger');

class NacosProxy {
  /**
  * @type {NacosProxy}
  */
  _instance = null;
  constructor() {
    const nacosClient = new NacosNamingClient({
      logger: console,
      serverList: \`\${config.nacos.server.host}:\${config.nacos.server.port}\`,
      namespace: \`\${config.nacos.namespace}\`
    })
    this.client = nacosClient;
    
    nacosClient.ready().then(()=>{
        const serviceName = \`\${config.app.name}\`;//服务名
        //开始注册
        nacosClient.registerInstance(serviceName, {
            ip: \`\${config.app.host}\`,
            port: \`\${config.app.port}\`,
        });
    });
  }

  static instance() {
    if(!this._instance) {
      this._instance = new NacosProxy();
    }
    return this._instance;
  }
}

async function init() {
  return NacosProxy.instance();
}

module.exports = {
  init,
  instance: NacosProxy.instance(),
};
`

const files = [
  {
    name: 'src/utils/nacosProxy.js',
    content: nacosProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "nacos"
  ],
  initSegments: [
    `await require('./utils/nacosProxy').init();`
  ]
}