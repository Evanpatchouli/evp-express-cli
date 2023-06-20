# evp-express-cli

[![npm](https://badge.fury.io/js/evp-express-cli.svg)](https://www.npmjs.com/package/evp-express-cli)


该软件包是一个 **Express.js CLI**，用于使用 info、log4js、数据库等交互初始化您的 Express 项目。

切换语言: [中文文档](./README_CN.md) | [English Doc](./README.md)

## 新闻

**v1.0.0:**
1. 生成的源码移至src目录。
2. 新增public目录。
2. 修复runSql的缺陷。

**v0.0.20:**
1. 修复 excatcher 中的 1 处bug。
2. 修复 redisProxy 中的 1 处bug。

**v0.0.19:**
1. 支持异常分类。

**v0.0.18:**
1. 更新 readme。

**v0.0.17:**
1. 支持全局的异步错误捕捉和处理。
2. 新增 **express-validator** 模板，以"validator"为名。
3. 修复了 RabbitMQ Proxy 中的一个互斥缺陷。

**v0.0.16**:
1. 支持babel，eslint，jest，pkg 和 pm2 开发工具。
2. 在package.json中添加开发脚本 clean。
3. 新增 `start`, `--info` 等命令。
4. 新增中文文档

## Documentation

- [安装](#安装)
- [用法](#用法)
  + [命令](#命令)
  + [新建项目](#新建项目)
  + [运行](#运行)
  + [模板](#模板)
    * [验证](#验证)
    * [数据库](#数据库)
    * [Redis](#redis)
    * [Auth](#auth)
    * [RabbitMQ](#rabbitmq)
    * [SocketIO](#socketio)
    * [Nacos](#nacos)
  + [开发工具](#开发工具)
    * [Babel](#babel)
    * [Esint](#eslint)
    * [Jest](#jest)
    * [Pkg](#pkg)
    * [PM2](#pm2)
  + [资源](#资源)
  + [配置](#配置)
  + [日志](#日志)
  + [异常处理](#异常处理)

## 安装

安装到局部目录
```shell
npm i evp-express-cli -D
```
或者全局安装
```shell
npm i evp-express-cli -g
```

## 用法

这里是一些示例。

### 命令

`evp-express`: 
 - `-v`, `--version`: 显示版本
 - `-i`, `--info`: 显示详细信息
 - `-h`, `--help`:  显示帮助信息
 - `new <projectName>`:  以一个特定的名字新建项目
 - `start`: 启动开发服务器

### 新建项目

不提前安装手脚架，直接从 npm 仓库拉取:
```shell
npx evp-express-cli new <projectName>
```
手脚架局部安装时:
```shell
npx evp-express new <projectName>
```
手脚架全局安装时:
```shell
evp-express new <projectName>
```

### 运行

切换至项目根目录下，通过以下命令运行: 
手脚架局部安装时:
```shell
npx evp-express start
```
手脚架全局安装时:
```shell
evp-express start
```
或者直接通过 npm 脚本:
```shell
npm run start
```
或者直接通过 node:
```shell
node index
```

### 模板


#### 验证

验证中间件位于 /midwares/valider.js

它导出了这些东西:
```js
module.exports = {
  validator,
  ValidRace,
  ValidAll,
  ValidQueue,
  ValidQueueAll
}
```
- validator 是 "express-validator"。
- ValidRace 是并发的验证检验链，并抛出最早检验出错误的那个。
- ValidAll 是并发的验证检验链，并抛出全部错误。
- ValidQueue 是串行的验证检验链，并抛出最早检验出错误的那个。
- ValidQueueAll 是串行的验证检验链，并抛出全部错误。

示例:
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
你将会得到如下结果:
```json
{
  "code":500,
  "msg":"name cannot be empty",
  "data":null,
  "symbol":-1,
  "type":"Bad Request"
}
```

#### 数据库

数据库模板使用 **mysql** 作为默认数据源， **mysql2** 作为默认数据驱动 和 **knex.js**作为默认数据库客户端.

你可以引用 knex-sqlClient 通过 `const { sqlClient } = require('utils/knex');`.

你可以更换任意其它的数据库，驱动和客户端. 但我强烈 **建议你不要** 删除 `utils/knex` 因为这个框架使用它去初始化数据库。

更多的配置信息可以在config.yaml找到.

#### Redis

Redis模板依赖于 **redis.js** 丙炔不附带身份认证, 如果你需要的话可以修改 `utils/redisProxy`.

你可以引用 redisProxy 通过 `const { instance } = require('utils/redisProxy');`. 你可以使用 `instance.client` 去获取redis客户端实例。

更多的配置信息可以在config.yaml找到.

#### Auth

认证模板只是安装了 **passport.js** 你需要自行配置。

#### RabbitMQ

RabbitMQ模板依赖于 **ampqlb.js** 并使用 "guest:guest" 作为默认用户.

你可以引用 异步的 rabbitmqProxy 通过 `const { instance } = require('utils/rabbitmqProxy');`. 你可以使用 `instance.conn` 去获取 rabbitmq连接实例.你可以使用 `instance.channel` 去获取rabbitmq的默认通道实例。

**注意它是一个promise**, 当被在任何地方引用时，请使用异步语法糖去获取实例，或者通过同步流的方式。
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

更多的配置信息可以在config.yaml找到.

#### SocketIO

SocketIO模板依赖于 **socket.io** 并且挂载服务器于 express-http-server 上.

你可以引用 socketioProxy 通过 `const { instance } = require('utils/socketioProxy');`. 你可以使用 `instance.server` 去获取 SocketIO 服务器实例。

更多的配置信息可以在config.yaml找到.

#### Nacos

Nacos模板依赖于 **nacos.js** 并且默认使用你项目的包名作为服务名。

你可以引用 nacosClient 通过 `const { instance } = require('utils/nacosProxy');`. 你可以使用 `instance.client` 去获取 Nacos 客户端实例。

更多的配置信息可以在config.yaml找到.

### 开发工具

#### Babel

Babel工具只是安装了基本的依赖和创建了一个配置文件。

你需要更多的自定义它。

#### Eslint

Eslint工具只是安装了基本的依赖

你需要更多的自定义它。

#### Jest

Jest工具只是安装了基本的依赖和创建了一个配置文件。此外, `package.json's scripts.test` 被替换为 "jest",你可以使用Jest进行快速测试通过 "npm test"命令.

你需要更多的自定义它。

#### Pkg

Pkg工具用于构建可执行的exe程序，输出目录为dist。

`package.json's scripts.build` 被替换为 "npx pkg . --out-path dist -t node16-win-x64". 你可以进行快速的构建通过"npm build"命令. 默认的编译目标是 node16-win-x64, 你可以在 package.json 中修改它并且你通常需要去Github上下载对应的目标node.

#### PM2

PM2是一个由node驱动的进程管理器. 框架创建了一个基础的配置文件(ecosystem.consig.js)

你可以更多的自定义它。

### 资源

框架将assets目录当作资源目录，请不要修改它！

### 配置

绝大多数配置信息被写在 assets/config.yaml 中. 你可以引用config通过 `global.__config` 或者 `__config`.

### 日志

日志工具位于 /utils/logger.js

### 异常处理

异常处理中间件位于 /midwares/exhandler.js

导出了两个中间件: 捕捉和日志.
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
在你抛出异常前，你可以设置 err.type 为 "fail" 并设置 error.symbol。在异常被捕获后，处理器将会匹配 error.type 来做出不同类型的响应。

你可以对其进行更多的自定义。

---

感谢您的使用!😊🥰