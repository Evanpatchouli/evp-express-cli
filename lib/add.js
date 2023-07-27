const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * @param {string} templateSelected 
 * @returns 
 */
module.exports = function(templateSelected) {
  // 规格化
  let templates = ['validator','database', 'redis', 'auth', 'rabbitmq', 'websocket', 'socketio', 'nacos'];
  let devtools = ['jest', 'pkg', 'pm2', 'eslint', 'babel'];
  if (!templates.includes(templateSelected) || !devtools.includes(devtools)) {
    console.log(chalk.red(`Template or Devtool of ${templateSelected} does not exist or not provided!`));
    return;
  }

  const projectPath = path.join(process.cwd());

  const publicPath = path.join(projectPath, "public");
  const srcPath = path.join(projectPath, "src");
  const assetsPath = path.join(srcPath, "assets"); 
  const utilsPath = path.join(srcPath, "utils");
  const routePath = path.join(srcPath, "router");
  const testPath = path.join(srcPath, "test");
  const modelPath = path.join(srcPath, "model");
  const midwaresPath = path.join(srcPath, "midwares");
  const packageJsonPath = path.join(projectPath, 'package.json');

  let configYamlContent = fs.readFileSync(path.join(assetsPath, 'config.yaml'));

  // 关联的依赖
  let dependencies = [];
  // 关联的文件
  let files = [];

  if (templates.includes(templateSelected)) {
    // 模板在 config.yaml 中的配置
    const template = require(`./templates/${templateSelected}`);
    if (template.configYaml) {
      configYamlContent += '\n' + template.configYaml;
    }
    
    if (template.dependencies) {
      dependencies.push(...template.dependencies);
    }

    // 模板的初始化过程开发者请手动添加

    if (template.files) {
      for (const file of template.files) {
        const filePath = path.join(projectPath, file.name);
        const fileContent = file.content;
        files.push({path: filePath, content: fileContent});
      }
    }
    files.push({path: path.join(assetsPath, 'config.yaml'), content: configYamlContent});
  } else {
    // DevTools
    const devtool = require(`./devtools/${templateSelected}`);
    dependencies.push(...devtool.dependencies);
    if (devtool.files) {
      for (const file of devtool.files) {
        const filePath = path.join(projectPath, file.name);
        const fileContent = file.content;
        files.push({path: filePath, content: fileContent});
      }
    }
    // 读取package.json
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    // 设置脚本
    if (devtools.length!=0) {
      for (const name of devtools) {
        const devtool = require(`./devtools/${name}`);
        packageJson = devtool.updPkgJson(packageJson);
      }
    }

    files.push({path: packageJsonPath, content: JSON.stringify(packageJson, null, 2)});
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

  // 写其余文件
  files.forEach(file => {
    process.stdout.write("\r\x1b[K")
    process.stdout.write(`Writing files: ${file.path}`);
    fs.writeFileSync(file.path, file.content, (err)=>{
      console.log(chalk.red(err));
    });
  });

  console.log(chalk.green(`\nCheers! Your have add ${templateSelected} to your project successfully!`));
  console.log(chalk.green(`Notice! Don't forget to init utils by yourself in init.js!`));
}