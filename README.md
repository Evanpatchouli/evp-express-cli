# evp-express-cli

<p>
  <a href="https://www.npmjs.com/package/evp-express-cli"><img alt="npmpackage" src="https://badge.fury.io/js/evp-express-cli.svg"></a>
  <a href="https://nodejs.org/en"><img alt="nodejs" src="https://img.shields.io/badge/NodeJS-16.17+-black.svg"></a>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/Express-4.x-%23007fff.svg"></a>
</p>

[![Security Status](https://www.murphysec.com/platform3/v31/badge/1671461396351311872.svg)](https://www.murphysec.com/console/report/1671461396074487808/1671461396351311872)


The package is a **Express.js CLI** to initialize your Express Project interactively with info, log4js, database and so on.

Change language: [中文文档](./README_CN.md) | [English Doc](./README.md)

## News

**Latest 5 versions reports:**

**v1.0.9**
1. Improve utils/knex.js runSql function
2. New util/knex.js runSqlFile function
3. New Text bodyparser in midwares/bodyparser.js

**v1.0.8**
1. Fix bugs: v1.0.7 has several wrongs

**v1.0.7**
1. Fix bugs: v1.0.6 has 1 wrong in config.js

**v1.0.6**
1. New command of `add <template>`
2. Fix bugs: v1.0.5 has 1 wrong in config.js

**v1.0.5**
1. Fix bugs: v1.0.4 has 2 wrong in config.js

## Documentation

- [Installation](#install)
- [Usages](#usages)
  + [command](#command)
  + [Create new project](#create-new-project)
  + [Running](#running)
  + [Templates](#templates)
    * [Validator](#validator)
    * [Database](#database)
    * [Redis](#redis)
    * [Auth](#auth)
    * [RabbitMQ](#rabbitmq)
    * [SocketIO](#socketio)
    * [Nacos](#nacos)
  + [DevTools](#devtools)
    * [Babel](#babel)
    * [Esint](#eslint)
    * [Jest](#jest)
    * [Pkg](#pkg)
    * [PM2](#pm2)
  + [Assets](#assets)
  + [Config](#config)
  + [Logger](#logger)
  + [ExHandler](#exhandler)

## Install

Install CLI to local directory
```shell
npm i evp-express-cli
```
Or install to global environment
```shell
npm i evp-express-cli -g
```

## Usages

Here are some examples.

### command

`evp-express`: 
 - `-v`, `--version`: show version
 - `-i`, `--info`: show information
 - `-h`, `--help`:  display help for command
 - `new <projectName>`:  create a new Express.js project with the specified name
 - `start`: start and lauch the project dev server.
 - `clean <path>`: clean up all files in this path if exists.
 - `add <template>`: add certain template or devtool.

### Create new project

Directly with npx from npm repository :
```shell
npx evp-express-cli new <projectName>
```
Cli locally installed:
```shell
npx evp-express new <projectName>
```
Cli globally installed:
```shell
evp-express new <projectName>
```

### Running

Change directory to your project's root directory, and start running the server with: 
Cli locally installed:
```shell
npx evp-express start
```
Cli globally installed:
```shell
evp-express start
```
Or just start with npm script:
```shell
npm run start
```
Or start with node directly:
```shell
node index
```

### Tempates


#### Validator

validator middleware is at /midwares/valider.js

It exports these midware functions:
```js
module.exports = {
  validator,
  ValidRace,
  ValidAll,
  ValidQueue,
  ValidQueueAll
}
```
- validator is package of "express-validator".
- ValidRace is to valid chains concurrently and throws the fastest one.
- ValidAll is to valid chains concurrently and throws all result.
- ValidQueue is to valid chains sequentially and throws the first one.
- ValidQueueAll is to valid chains sequentially and throws all result.

example:
```js
const { validator, ValidQueue } = require('../midwares/valider');

router.get('/',
  ValidQueue([
    validator.query('name').trim().notEmpty().withMessage("name cannot be empty"),
    validator.query('age').trim()
      .notEmpty().withMessage("age cannot be empty").bail()
      .isInt().withMessage("age must be Int").bail().toInt()
  ]),
(req, res, next) => {
  res.send(`Hello ${req.query.name}, you are ${req.query.age} years old!`);
});
```
And you will get response like this:
```json
{
  "code":500,
  "msg":"name cannot be empty",
  "data":null,
  "symbol":-1,
  "type":"Bad Request"
}
```

#### Database

The Database Template use **mysql** as default datasource **mysql2** as default mysql driver and **knex.js** as default sqlClient.

You can require the knex-sqlClient by `const { sqlClient } = require('utils/knex');`.

You can change to use any other database, driver and sqlClient. But I strongly **suggest you not** to delete the `utils/knex` because this framework uses it to init the database.

More about its configuration can be found in config.yaml.

#### Redis

The Redis Template depends on **redis.js** and does not with auth, if you need it, you can modify the `utils/redisProxy`.

You can require the redisProxy by `const { instance } = require('utils/redisProxy');`. You can use `instance.client` to get the redis client instance.

More about its configuration can be found in config.yaml.

#### Auth

The Auth Template only installs the package **passport.js** and you should customize it by yourself.

#### RabbitMQ

The RabbitMQ Template depends on **ampqlb.js** and use "guest:guest" as default user.

You can require the future rabbitmqProxy by `const { instance } = require('utils/rabbitmqProxy');`. You can use `instance.conn` to get the RabbitMQ connection.You can use `instance.channel` to get the default channel of RabbitMQ connection.

**Notice that it is a promise**, when imported anywhere else please await in async funtion or then-flow to initialize a var of its instance.
```javascript
const { instance } = require('../utils/rabbitmqProxy');

app.get('/', async(req, res)=>{
const rbmqProxy = await instance;
  const { channel: rbmq } = rbmqProxy;
  rbmq.sendToQueue("queue", "hello");
})
```
**Or like this:**
```javascript
const RabbitmqProxy = require('../utils/rabbitmqProxy');

app.get('/', async(req, res)=>{
  const rbmqProxy = await RabbitmqProxy.instance;
  const { channel: rbmq } = rbmqProxy;
  rbmq.sendToQueue("queue", "hello");
})
```
**Or like this:**
```javascript
const amqplib = require('amqplib');
const RabbitmqProxy = require('../utils/rabbitmqProxy');

//@type {amqplib.Channel}
let rbmq = null;
RabbitmqProxy.instance.then(rabbitmq=>{
  rbmq = rabbitmq.channel;
})

app.get('/', async(req, res)=>{
  rbmq.sendToQueue("queue", "hello");
})
```

More about its configuration can be found in config.yaml.

#### SocketIO

The SocketIO Template depends on **socket.io** and mounts SockerIO Server on express-http-server.

You can require the socketioProxy by `const { instance } = require('utils/socketioProxy');`. You can use `instance.server` to get the SocketIO Server instance.

More about its configuration can be found in config.yaml.

#### Nacos

The Nacos Template depends on **nacos.js** and use your project's package.json's name as service name.

You can require the nacosClient by `const { instance } = require('utils/nacosProxy');`. You can use `instance.client` to get the Nacos Client instance.

More about its configuration can be found in config.yaml.

### DevTools

#### Babel

The Babel DevTool only installs basic dependencies and creates a basic babel.config.js file. 

You should customize babel more by yourself.

#### Eslint

The Eslint DevTool only installs basic dependencies. 

You should customize it more by yourself.

#### Jest

The Jest DevTool only installs basic dependencies and creates a basic jest.config.js file. Besides, the `package.json's scripts.test` is replaced with "jest", you can quickly test by jest with command "npm test".

You can customize jest more by yourself.

#### Pkg

The Pkg DevTool is for building to a executable exe file. The build output directory is dist.

The `package.json's scripts.build` is replaced with "npx pkg . --out-path dist -t node16-win-x64". You can quickly start build with command "npm build". The default target is node16-win-x64, you can modify it in package.json and you should download the target node from github personally commonly.

#### PM2

The PM2 DevTool is a process manager that driven by node. It creates a basic ecosystem.config.js file.

You can customize pm2 more by yourself.

### Assets

The framework use assets as default static resources folder. Please don't change it!

### Config

Most of the configuration are written in assets/config.yaml. And you can get the config by require `global.__config` or `__config`.

### logger

logger tool is at /utils/logger.js

### Exhandler

exhandler is at /midwares/exhandler.js

There are two middlewares: catcher and logger.
```js
module.exports = {
  excatcher: (err, req, res, next) => {
    if (err) {
      const {code,msg,symbol,data,back} = err.message;
      if (back != false && code) {
        if (code) {
          if (code == 400) {
            res.json(Resp.fail(msg, symbol??-1, data??null));
          }
          if (code == 500) {
            res.json(Resp.bad(msg, symbol??0, data??null));
          }
        } else {
          res.json(Resp.bad(err.message));
        }
      }
      next(err);
    } else {
      next();
    }
  },

  exlogger: (err,req,res,next)=>{
    if (logger.level.level <= 10000) {
      logger.error(err);
      return;
    }
    logger.error(err.message);
  }
}
```
Usually, after catching global errors, the default response is Resp.bad. But sometimes we don't wanna bad.
```javascript
throw new Error(JSON.stringify({code:400,msg:"Invalid arguments."});
```
Even we don't need to retuen the error, we can give "false" to "back".
```javascript
throw new Error(JSON.stringify({code:400,msg:"Invalid arguments.",back:false});
```
The framework only supports code of 200 and 400, but you can customize it more.

---

Thanks for using!😊🥰