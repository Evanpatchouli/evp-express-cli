const configYaml = 
`import { NacosNamingClient } from "nacos";

class NacosProxy {
  static INSTANCE: NacosProxy|undefined;
  client: NacosNamingClient
  constructor() {
    const nacosClient = new NacosNamingClient({
      logger: console,
      serverList: \`\${__config.nacos.server.host}:\${__config.nacos.server.port}\`,
      namespace: \`\${__config.nacos.namespace}\`
    })
    this.client = nacosClient;
    
    nacosClient.ready().then(()=>{
        const serviceName = __config.app.name;// service name
        // Start to register
        nacosClient.registerInstance(serviceName, {
            ip: __config.app.host,
            port: __config.app.port,
        });
    });
  }

  static instance() {
    if(!this.INSTANCE) {
      this.INSTANCE = new NacosProxy();
    }
    return this.INSTANCE;
  }
}

async function init() {
  return NacosProxy.instance();
}

export = {
  init,
  instance: NacosProxy.instance(),
};
`

const files = [
  {
    name: 'src/utils/nacosProxy.ts',
    content: nacosProxy
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "nacos"
  ],
  importSegments: [
    `import NacosProxy from './utils/nacosProxy';`
  ],
  initSegments: [
    `await NacosProxy.init();`
  ]
}