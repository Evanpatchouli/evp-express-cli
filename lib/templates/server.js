const server =
`const http = require('http');
const server = http.createServer();

module.exports = server;
`;

module.exports = {
  name: 'utils/server.js',
  content: server
}