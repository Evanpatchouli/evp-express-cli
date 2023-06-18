const configYaml = 
`nacos:
  server:
    host: 127.0.0.1
    port: 8848
  namespace: public
`;

const nacosProxy =
`const NacosNamingClient = require('nacos').NacosNamingClient;
const logger = require('./logger');

class NacosProxy {
  /**
  * @type {NacosProxy}
  */
  _instance = null;
  constructor() {
    const nacosClient = new NacosNamingClient({
      logger: console,
      serverList: \`\${__config.nacos.server.host}:\${__config.nacos.server.port}\`,
      namespace: \`\${__config.nacos.namespace}\`
    })
    this.client = nacosClient;
    
    nacosClient.ready().then(()=>{
        const serviceName = \`\${__config.app.name}\`;//服务名
        //开始注册
        nacosClient.registerInstance(serviceName, {
            ip: \`\${__config.app.host}\`,
            port: \`\${__config.app.port}\`,
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
    name: 'utils/nacosProxy.js',
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
    `await require('./${files[0].name}').init();`
  ]
}