const content = 
`import net from "net";
import init = require("./init");
import JsTextChart from "js-text-chart";
import Config from './config';
Config.init();
import server = require("./utils/server");
import app = require("./app");

async function start() {
  await init();
  
  server.on('request', app);
  server.listen(__config.app.port, __config.app.host, async() => {
    const address = server.address() as net.AddressInfo;
    let host = address.address;
    let port = address.port;
  
    let str = __config.app.name;
    let chart = JsTextChart.convert(str, "close");
    console.log(chart);
  
    console.log("Server is ready on http://%s:%s", host, port);
  });
}

start();
`;

module.exports = {
  name: "src/index.ts",
  content,
  files: [],
}