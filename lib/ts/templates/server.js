const server =
`import http from 'http';
const server = http.createServer();

export = server;
`;

module.exports = {
  name: 'src/utils/server.ts',
  content: server
}