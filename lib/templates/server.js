const server =
`const http = require('http');
const server = http.createServer();

module.exports = server;
`;

module.exports = {
  name: 'src/utils/server.js',
  content: server
}