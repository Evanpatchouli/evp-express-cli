#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const inquirer = require('inquirer');
const chalk = require('chalk');
const package = require("./package.json");
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = function cli() {
  program
  .name('evp-express')
  .version(`evp-express-cli@${package.version}`, '-v, --version', 'show version')
  .description('Cli to create a new Express.js project')
  .option('-i, --info', 'show information')
  .action(()=>{
    let offset = '';
    for (let i = 0; i <28-`evp-express-cli@${package.version}`.length/2; i++) {
      offset += " ";
    }
    console.log(' -------------------------------------------------------');
    console.log(`|${offset}evp-express-cli@${package.version}                |`);
    console.log(`|                 Author: evanpatchouli                 |`);
    console.log('|        A cli to create a new Express.js project.      |')
    console.log(`|  Repo: https://www.npmjs.com/package/evp-express-cli  |`)
    console.log(' -------------------------------------------------------');
  });

  program
  .command('new <projectName>')
  .description('create a new Express.js project with the specified name.')
  .usage('<projectName>')
  .action(async (projectName) => {
    console.clear();
    console.log(chalk.green('Cli to create a new Express.js project'));
    console.log(chalk.blue('Configuring the priject first:'));
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: projectName,
      },
      {
        type: 'input',
        name: 'host',
        message: 'App host:',
        default: '127.0.0.1',
      },
      {
        type: 'input',
        name: 'port',
        message: 'App port:',
        default: 8080,
      },
      {
        type: 'list',
        name: 'logLevel',
        message: 'logLevel:',
        default: 'INFO',
        choices: ['ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'MARK', 'OFF'],
        loop: false
      },
      {
        type: 'checkbox',
        name: 'templates',
        message: 'Choose preserved templates:',
        choices: [
          'None', 'validator', 'database', 'redis', 'auth', 'rabbitmq', 'socketio', 'nacos', 'All'
        ],
        pageSize: 9,
        loop: false
      },
      {
        type: 'checkbox',
        name: 'devtools',
        message: 'Choose preserved devtools:',
        choices: [
          'None', 'jest', 'pkg', 'pm2', 'eslint', 'babel' , 'All'
        ],
        pageSize: 7,
        loop: false
      },
      {
        type: 'confirm',
        name: 'create',
        message: 'Confirm your config and create project right now?',
        default: true,
        when: (answers) => {
          console.log(chalk.blue('Your config:'));
          console.log(answers);
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'reconfig',
        message: 'Rechoose the config or exit directly?',
        default: false,
        when: (answers) => !answers.create,
      }
      // {console.log(answers);
      //   type: 'password',
      //   name: 'rabbitmqPass',
      //   message: 'RabbitMQ password:',
      //   mask: '*',
      //   default: 'root',
      // },
    ];

    let answers = await inquirer.prompt(questions);
    while (!answers.create) {
      if (!answers.reconfig) {
        return;
      } else {
        answers = await inquirer.prompt(questions);
      }
    }
    const creator = require("./lib/creator");
    console.log(chalk.blue('Start to initialize the project:'));
    creator(answers);
  });

  program.command('start')
  .description('start and lauch the project dev server.')
  .action(()=>{
    const pros = spawn('node', ["src/index"], {cwd: process.cwd()});
    pros.stderr.on('error', err => console.error(`${err}`));
    pros.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    pros.on('error', (err) =>{
      console.error(`${err}`);
    })
    pros.on('close', (code) => {
      console.log(`process exited with code ${code}`);
    }); 
  })

  function deleteFolder(folder, tolist) {
    let files = [];
    const _path = folder;
    if(fs.existsSync(_path)) {
      files = fs.readdirSync(_path);
      files.forEach(function(file, index) {
        let curPath = path.join(_path, file);
        if(fs.statSync(curPath).isDirectory()) {
          deleteFolder(curPath, tolist);
        } else {
          if(tolist){
            process.stdout.write("\r\x1b[K");
            process.stdout.write(`Delete file: ${curPath}`);
          }
          fs.unlinkSync(curPath);
        }
      });
      if(tolist){
        process.stdout.write("\r\x1b[K");
        process.stdout.write(`Delete dictory: ${folder}`);
      }
      fs.rmdirSync(folder);
    } else {
      flag = false;
      console.log(chalk.red(`${folder} not exists!`));
    }
  }

  program
  .command("clean <folder>")
  .description(
    'Clean certain file path.\n'+
    '  Options:\n'+
    '    -l,--list             List out the deleted files and folders.')
  .option('-l, --list', 'List out the deleted files and folders.')
  .action((folder, options)=>{
    let flag = false;
    flag = true;
    deleteFolder(path.join(process.cwd(), folder), options.list);
    if (flag) {
      process.stdout.write("\r\x1b[K");
      console.log(chalk.green(`Folder ${folder} has been clean!`));
    }
  });

  program.parse(process.argv);


}
