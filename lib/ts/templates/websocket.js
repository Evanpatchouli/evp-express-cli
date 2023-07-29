const configYaml = null;

const ws = 
`import { WebSocketServer } from 'ws';
import server from './server';

class WebsocketProxy {
  static INSTANCE: WebsocketProxy;
  server?: WebSocketServer;
  constructor() {
    const _server = new WebSocketServer({
      server: server
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

export = {
  init,
  instance: WebsocketProxy.instance()
};
`;

const files = [
  {
    name: 'src/utils/websocketProxy.ts',
    content: ws
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "ws", "@types/ws -D"
  ],
  importSegments: [
    `import WebsocketProxy from './utils/websocketProxy';`
  ],
  initSegments: [
    `await WebsocketProxy.init();`
  ]
}