const configYaml = null;

const socketio = 
`const { Server } = require('socket.io');
const server = require('./server');
const logger = require('./logger');

class SocketIoProxy {
  /**
   * @type {Server}
   */
  _instance = null;
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
    if(!this._instance){
      this._instance = new SocketIoProxy();
    }
    return this._instance;
  }
}

async function init() {
  return SocketIoProxy.instance();
}

module.exports = {
  init,
  instance: SocketIoProxy.instance()
}
`;

const files = [
  {
    name: 'utils/socketioProxy.js',
    content: socketio
  }
];

module.exports = {
  configYaml,
  files,
  dependencies: [
    "socket.io"
  ],
  initSegments: [
    `await require('./${files[0].name}').init();`
  ]
}