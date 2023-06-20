# evp-express-cli

[![npm](https://badge.fury.io/js/evp-express-cli.svg)](https://www.npmjs.com/package/evp-express-cli)


The package is a **Express.js CLI** to initialize your Express Project interactively with info, log4js, database and so on.

Change language: [中文文档](./README_CN.md) | [English Doc](./README.md)

## News

**v1.0.0:**
1. The source code generated moved to src folder.
2. Add public folder.
3. Fix 1 bug in runSql.

**v0.0.20:**
1. Fix 1 bug in excatcher.
2. Fix 1 bug in redisProxy.

**v0.0.19:**
1. Support exception classified.

**v0.0.18:**
1. Update readme.

**v0.0.17:**
1. Support global async-errors catch and handle.
2. New template of **express-validator** as "validator".
3. Fix 1 bug about mutex in RabbitMQ Proxy.

**v0.0.16:**
1. Support devtools of babel, eslint, jest, pkg and pm2.
2. Add devScript clean in package.json
3. add command `start`, `--info` and so on.
4. add Chinese Documentation.

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
      if(err.type = 'fail'){
        res.json(Resp.fail(err.message, err.symbol??-1, err.data??null));
      } else {
        res.json(Resp.bad(err.message));
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
Before you throw an exception, you can set error.type as "fail" and set error.symbol number. After error catched, handler will match the error.type to response different Resp.

You can customize it more by yourself.

---

Thanks for using!😊🥰