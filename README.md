# evp-express-cli

[![npm](https://badge.fury.io/js/evp-express-cli.svg)](https://www.npmjs.com/package/evp-express-cli)


The package is a **Express.js CLI** to initialize your Express Project interactively with info, log4js, database and so on.

## Updates

**v0.0.11**:
1. Support devtools of babel, eslint, jest, pkg and pm2.
2. Add devScript clean in package.json
3. add command

## Documentation

- [Installation](#install)
- [Usages](#usages)
  + [command](#command)
  + [Create new project](#create-new-project)
  + [Templates](#templates)
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

evp-express
 - `-v`, `--version`: show version
 - `-i`, `--info`: show information
 - `-h`, `--help`:  display help for command
 - `new <projectName>`:  create a new Express.js project with the specified name

### Create new project

CLI locally installed
```shell
npx evp-express new <projectName>
```
CLI globally installed
```shell
evp-express new <projectName>
```

### Tempates

#### Database

The Database Template use **mysql** as default datasource **mysql2** as default mysql driver and **knex.js** as default sqlClient.

You can require the knex-sqlClient by `const { sqlClient } = require('utils/knex');`.

You can change to use any other database, driver and sqlClient. But I strongly **suggest you not** to delete the `utils/knex` because this framework uses it to init the database.

More about its configuration can be found in config.yaml.

#### Redis

The Redis Template depends on **redis.js** and does not with auth, if you need it, you can modify the `utils/redisProxy`.

You can require the redisProxy by `const { redisProxy } = require('utils/redisProxy');`. You can use `redisProxy.client` to get the redis client instance.

More about its configuration can be found in config.yaml.

#### Auth

The Auth Template only installs the package **passport.js** and you should customize it by yourself.

#### RabbitMQ

The RabbitMQ Template depends on **ampqlb.js** and use "guest:guest" as default user.

You can require the rabbitmqProxy by `const { rabbitmqProxy } = require('utils/rabbitmqProxy');`. You can use `rabbitmqProxy.conn` to get the RabbitMQ connection.You can use `rabbitmqProxy.channel` to get the default channel of RabbitMQ connection.

More about its configuration can be found in config.yaml.

#### SocketIO

The RabbitMQ Template depends on **socket.io** and mounts SockerIO Server on express-http-server.

You can require the socketioProxy by `const { socketioProxy } = require('utils/socketioProxy');`. You can use `socketioProxy.server` to get the SocketIO Server instance.

More about its configuration can be found in config.yaml.

#### Nacos

The RabbitMQ Template depends on **nacos.js** and use your project's package.json's name as service name.

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

---

Thanks for using!😊🥰