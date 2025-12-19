const configYaml = null;

const socketio = 
`import { Server } from 'socket.io';
import server from './server';
import logger from './logger';

class SocketIoProxy {
  static INSTANCE?: SocketIoProxy;
  server?: Server;
  constructor() {
    this.server = new Server(server);
    logger.info('SocketIo server created!');
    this.server.on('connection', (socket) => {
      socket.on('message', (data) => {
        logger.info(\`client: \${JSON.stringify(data)}\`);
        socket.emit('message', data);
      });
    });
  }

  static instance(){
    if(!this.INSTANCE){
      this.INSTANCE = new SocketIoProxy();
    }
    return this.INSTANCE;
  }
}

async function init() {
  return SocketIoProxy.instance();
}

const socketioProxy = {
  init,
  instance: SocketIoProxy.instance()
}

export default socketioProxy;
`;

const files = [
  {
    name: 'src/utils/socketioProxy.ts',
    content: socketio
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "socket.io"
  ],
  importSegments: [
    `import SocketioProxy from './utils/socketioProxy';`
  ],
  initSegments: [
    `await SocketioProxy.init();`
  ]
}