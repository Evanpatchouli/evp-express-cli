const server =
`import http from 'http';
const server = http.createServer();

export default server;
`;

module.exports = {
  name: 'src/utils/server.ts',
  content: server
}
