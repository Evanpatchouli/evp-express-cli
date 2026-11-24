const content = `async function start() {
  const config = require('./config').get();
  const app = require('./app');
  const server = require('./utils/server');
  server.on('request', app);
  await require('./init')();

  server.listen(config.app.port, config.app.host, () => {
    const { address, port } = server.address();
    console.log(require('js-text-chart').convert(config.app.name, 'close'));
    console.log('Server is ready on http://%s:%s', address, port);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
`;

module.exports = { name: 'src/index.js', content, files: [] };
