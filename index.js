#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const inquirer = require('inquirer');
const chalk = require('chalk');
const pkg = require("./package.json");
const path = require('path');
const fs = require('fs');
const { templates, devtools, selectionValidator } = require('./lib/registry');

module.exports = function cli() {
  program
  .name('evp-express')
  .version(`evp-express-cli@${pkg.version}`, '-v, --version', 'show version')
  .description('Cli to create a new Express.js project')
  .option('-i, --info', 'show information')
  .action(()=>{
    let left = '';
    for (let i = 0; i <27-`evp-express-cli@${pkg.version}`.length/2; i++) {
      left += " ";
    }
    let right = '';
    for (let i = 0; i < 55 - left - `evp-express-cli@${pkg.version}`.length - 27; i++) {
      right += " ";
    }
    console.log(' -------------------------------------------------------');
    console.log(`|${left}evp-express-cli@${pkg.version}${right}          |`);
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
        name: 'lang',
        message: 'Language:',
        default: 'JavaScript',
        choices: ['JavaScript', 'TypeScript'],
        loop: false
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
        choices: ['None', ...templates, 'All'],
        validate: selectionValidator(templates),
        pageSize: 11,
        loop: false
      },
      {
        type: 'list', name: 'transport',
        message: 'Choose the real-time transport for this project:',
        choices: ['websocket', 'socketio'],
        when: answers => answers.templates.includes('All')
      },
      {
        type: 'checkbox',
        name: 'devtools',
        message: 'Choose preserved devtools:',
        choices: ['None', ...devtools, 'All'],
        validate: selectionValidator(devtools),
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
    if (answers.lang == 'TypeScript') {
      const tscreator = require("./lib/ts/creator");
      tscreator(answers)
    } else {
      creator(answers);
    }
    
  });

  program.command('start')
  .description('start and lauch the project dev server.')
  .action(() => require('./lib/start')(process.cwd()));

  program.command('clean <folder>')
    .description('Remove a directory inside the current working directory.')
    .option('-l, --list', 'List removed entries.')
    .action((folder, options) => {
      require('./lib/clean')(process.cwd(), folder, options.list ? console.log : undefined);
      console.log('Removed ' + folder);
    });

  program
  .command("show")
  .description('Show all templates and devtools.')
  .action(()=>{
    console.log(chalk.blueBright("Templates:"));
    templates.forEach(template => console.log(`  ${template}`));
    console.log(chalk.blueBright("Devtools:"));
    devtools.forEach(devtool => console.log(`  ${devtool}`));
  });

  program
  .command("add <template>")
  .description('Add certain template or devtool.')
  .action((template)=>{
    let evpconfigJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'evpconfig.json'), 'utf8'));
    let add;
    if (evpconfigJson.lang.toLowerCase() == 'typescript') {
      add = require('./lib/ts/add');
    } else {
      add = require('./lib/add');
    }
    add(template);
  });

  return program.parseAsync(process.argv);

}
