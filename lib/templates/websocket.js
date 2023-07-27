const configYaml = null;

const ws = 
`const { WebSocketServer } = require('ws');

class WebsocketProxy {
  /**@type {WebsocketProxy} */
  static INSTANCE;
  /**@type {WebSocketServer} */
  server;
  constructor() {
    const _server = new WebSocketServer({
      server: require('./server')
    })

    this.server = _server;
    
    this.server.on("listening", () => {
      console.log(\`websocket server is listening.\`);
    })

    this.server.on("connection", (ws) => {
      console.log(\`websocket client connection\`);
      ws.send(\`Hello, I'm WebSocket server.\`);
      ws.on("message", (message) => {
        ws.send(\`\${message}\`);
      })
    })
  }

  static instance() {
    if(!WebsocketProxy.INSTANCE) {
      WebsocketProxy.INSTANCE = new WebsocketProxy();
    }
    return WebsocketProxy.INSTANCE;
  }
}

function init() {
  return WebsocketProxy.instance();
}

module.exports = {
  init,
  instance: WebsocketProxy.instance()
};
`;

const files = [
  {
    name: 'src/utils/wsProxy.js',
    content: ws
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "ws"
  ],
  initSegments: [
    `await require('./utils/wsProxy').init();`
  ]
}