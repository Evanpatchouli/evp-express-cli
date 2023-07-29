const logger = {
  name: "src/utils/logger.ts",
  content:
`import log4js from 'log4js';

//const config = Config.get();
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
      level: __config.log4js.level
    }
  }
})

export = logger;
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