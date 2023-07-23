const logger = {
  name: "src/utils/logger.js",
  content:
`const config = require('../config').get();
const log4js = require('log4js');

let logger = log4js.getLogger("");
    
log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
          "type": "pattern",
          "pattern": "[%d{yyyy-MM-dd hh:mm:ss}] %p %m"
      }
    }
  },
  categories: {
    default: {
      appenders: ["out"],
      level: config.log4js.level
    }
  }
})

module.exports = logger;
`
}

class Log4gs {
  constructor(answers) {
    this.configYaml = 
`log4js:
  level: ${answers.logLevel}
`;
    this.files = [logger];
    this.dependencies = [
      "log4js"
    ];
    this.initSegments = []
  }
}

module.exports = Log4gs;