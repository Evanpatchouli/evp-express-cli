const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

module.exports = function(answers) {
  const projectPath = path.join(process.cwd(), answers.name);

  const publicPath = path.join(projectPath, "public");
  const srcPath = path.join(projectPath, "src");
  const assetsPath = path.join(srcPath, "assets"); 
  const utilsPath = path.join(srcPath, "utils");
  const routePath = path.join(srcPath, "router");
  const testPath = path.join(srcPath, "test");
  const modelPath = path.join(srcPath, "model");
  const midwaresPath = path.join(srcPath, "midwares");

  if (fs.existsSync(projectPath)) {
    console.log(`Project "${answers.name}" already exists.`);
    return;
  }

  fs.mkdirSync(projectPath);
  fs.mkdirSync(publicPath);
  fs.mkdirSync(srcPath);
  fs.mkdirSync(assetsPath);
  fs.mkdirSync(utilsPath);
  fs.mkdirSync(routePath);
  fs.mkdirSync(testPath);
  fs.mkdirSync(modelPath);
  fs.mkdirSync(midwaresPath);

  /**
   * @type {{path:string, content:string}[]}
   */
  let files = [];
  let dependencies = [
    'evp-express-cli -D',
    'express',
    '@types/express -D',
    'js-text-chart',
    'js-yaml',
    'log4js',
  ]

  // index.js 模板
  const index = require("./templates/index");
  files.push({path: path.join(projectPath, index.name), content: index.content});

  // indexRouter.js 模板
  const indexRoutes = require("./templates/indexRouter");
  files.push({path: path.join(projectPath, indexRoutes.name), content: indexRoutes.content});

  // bodyParser.js 模板
  const bodyParser = require("./templates/bodyParser");
  files.push({path: path.join(projectPath, bodyParser.name), content: bodyParser.content});
  dependencies.push(...bodyParser.dependencies);

  // resp.js 模板
  const resp = require("./templates/resp");
  files.push({path: path.join(projectPath, resp.name), content: resp.content});

  // app.js 模板
  const app = require("./templates/app");
  files.push({path: path.join(projectPath, app.name), content: app.content});

  // server.js 模板
  const server = require("./templates/server");
  files.push({path: path.join(projectPath, server.name), content: server.content});

  // 主初始化模板
  let init = require("./templates/init");

  // config.js 模板
  const config = require("./templates/config");
  files.push({path: path.join(projectPath, config.name), content: config.content});

  // config.yaml
  let configYamlContent = 
`app:
  name: ${answers.name}
  host: ${answers.host}
  port: ${answers.port}
assets: default
public: default
`;

  // exhandler 模板
  const exhandler = require('./templates/exhandler');
  dependencies.push(...exhandler.dependencies);
  for (const file of exhandler.files) {
    const filePath = path.join(projectPath, file.name);
    const fileContent = file.content;
    files.push({path: filePath, content: fileContent});
  }
  init.put(exhandler.initSegments);

  // log4js 模板
  const Log4jg = require('./templates/log4js');
  const log4js = new Log4jg(answers);
  configYamlContent += '\n' + log4js.configYaml;
  dependencies.push(...log4js.dependencies);
  for (const file of log4js.files) {
    const filePath = path.join(projectPath, file.name);
    const fileContent = file.content;
    files.push({path: filePath, content: fileContent});
  }
  init.put(log4js.initSegments);

  // 其它模板列表规格化
  let templatesSelected = ['validator','database', 'redis', 'auth', 'rabbitmq', 'socketio', 'nacos'];
  if (JSON.stringify(answers.templates)!='["All"]') {
    if (JSON.stringify(answers.templates)=='["None"]') {
      templatesSelected = [];
    } else {
      templatesSelected = answers.templates;
    }
  }

  // 遍历插入模板
  if (JSON.stringify(templatesSelected) != '[]') {
    for (const templateSelected of templatesSelected) {
      // 模板在 config.yaml 中的配置
      const template = require(`./templates/${templateSelected}`);
      if (template.configYaml) {
        configYamlContent += '\n' + template.configYaml;
      }

      // 依赖
      if (template.dependencies) {
        dependencies.push(...template.dependencies);
      }

      // 在主初始化模板中插入其它模板的初始化过程
      if (template.initSegments) {
        init.put(template.initSegments);
      }

      // 模板关联的文件
      if (template.files) {
        for (const file of template.files) {
          const filePath = path.join(projectPath, file.name);
          const fileContent = file.content;
          files.push({path: filePath, content: fileContent});
        }
      }
    }
  }

  files.push({path: path.join(projectPath, init.name), content: init.content()});

  // DevTools
  let devtools = ['jest', 'pkg', 'pm2', 'eslint', 'babel'];
  if (JSON.stringify(answers.devtools)!='["All"]') {
    if (JSON.stringify(answers.devtools)=='["None"]') {
      devtools = [];
    } else {
      devtools = answers.devtools;
    }
  }
  if (devtools.length!=0) {
    for (const name of devtools) {
      const devtool = require(`./devtools/${name}`);
      dependencies.push(...devtool.dependencies);
      if (devtool.files) {
        for (const file of devtool.files) {
          const filePath = path.join(projectPath, file.name);
          const fileContent = file.content;
          files.push({path: filePath, content: fileContent});
        }
      }
    }
  }

  const cliProgress = require('cli-progress');

  // note: you have to install this dependency manually since it's not required by cli-progress
  const colors = require('ansi-colors');

  // create new progress bar
  const bar = new cliProgress.SingleBar({
      format: 'Install progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Packages || Installing: {speed}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: false
  });

  const count = dependencies.length;
  // initialize the bar - defining payload token "speed" with the default value "N/A"
  bar.start(count, 0, {
      speed: "N/A"
  });
  // 生成 package.json
  execSync('npm init -y', { cwd: projectPath });
  // 安装依赖
  for (const key in dependencies) {
      const dependency = dependencies[key];
      bar.update({
        speed: dependency
      });
      execSync(`npm install ${dependency}`, { cwd: projectPath });
      bar.update(Number(key)+1);
  }
  bar.stop();

  files.push({path: path.join(assetsPath, 'config.yaml'), content: configYamlContent});

  const packageJsonPath = path.join(projectPath, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  // 设置脚本
  packageJson.scripts = {
      test: "echo \"Error: no test specified\" && exit 1",
      start: 'npx evp-express start'
  };

  if (devtools.length!=0) {
    for (const name of devtools) {
      const devtool = require(`./devtools/${name}`);
      packageJson = devtool.updPkgJson(packageJson);
    }
  }

  files.push({path: packageJsonPath, content: JSON.stringify(packageJson, null, 2)});
  
  const gitignoreContent = 
`node_modules
dist
coverage
`;
  
  files.push({path: path.join(projectPath, '.gitignore'), content: gitignoreContent});

  // 写其余文件
  files.forEach(file => {
    process.stdout.write("\r\x1b[K")
    process.stdout.write(`Writing files: ${file.path}`);
    fs.writeFileSync(file.path, file.content, (err)=>{
      console.log(chalk.red(err));
    });
  });

  console.log(chalk.green(`\nCheers! Your project ${answers.name} initalized successfully! `));
  console.log(chalk.blue(`cd ${answers.name} and npm start`));
}