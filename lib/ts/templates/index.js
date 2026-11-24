const content = `import type { AddressInfo } from 'net';
import Config from './config';
Config.init();
import app from './app';
import server from './utils/server';
import init from './init';
import JsTextChart from 'js-text-chart';

async function start() {
  server.on('request', app);
  await init();
  server.listen(__config.app.port, __config.app.host, () => {
    const { address, port } = server.address() as AddressInfo;
    console.log(JsTextChart.convert(__config.app.name, 'close'));
    console.log('Server is ready on http://%s:%s', address, port);
  });
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
`;

module.exports = { name: 'src/index.ts', content, files: [] };
