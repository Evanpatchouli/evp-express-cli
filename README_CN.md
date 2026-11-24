# evp-express-cli

<p>
  <a href="https://www.npmjs.com/package/evp-express-cli"><img alt="npmpackage" src="https://badge.fury.io/js/evp-express-cli.svg"></a>
  <a href="https://nodejs.org/en"><img alt="nodejs" src="https://img.shields.io/badge/NodeJS-16.17+-black.svg"></a>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/Express-4.x-%23007fff.svg"></a>
</p>

[![Security Status](https://www.murphysec.com/platform3/v31/badge/1671461396351311872.svg)](https://www.murphysec.com/console/report/1671461396074487808/1671461396351311872)


交互式生成 JavaScript 或 TypeScript 的 Express 4 项目，可按需加入日志、数据库等服务集成和开发工具。

切换语言: [中文文档](./README_CN.md) | [English Doc](./README.md)

## 新闻

**最新的5个版本报告:**

**v1.2.3**
1. 修复: `knex.js` init
2. 修复: 将 `express` 版本设置为 v4.

**v1.2.2**
1. 新特性: 支持在 `npm start`之前 `SET PORT=<port number>`

**v1.2.1**
1. 修复 config 的初始化缺陷
2. 更新 `show` 命令 

**v1.2.0**
1. 支持 TypeScript
2. 新增 zod 模板

**v1.1.1**
1. 提供了 websocket 模板

## 文档

- [安装](#安装)
- [用法](#用法)
  + [命令](#命令)
  + [新建项目](#新建项目)
  + [运行](#运行)
  + [模板](#模板)
    * [验证](#验证)
    * [Zod](#zod)
    * [文件上传](#文件上传)
    * [数据库](#数据库)
    * [Redis](#redis)
    * [Auth](#auth)
    * [RabbitMQ](#rabbitmq)
    * [Websocket](#websocket)
    * [SocketIO](#socketio)
    * [Nacos](#nacos)
  + [开发工具](#开发工具)
    * [Babel](#babel)
    * [ESLint](#eslint)
    * [Jest](#jest)
    * [Pkg](#pkg)
    * [PM2](#pm2)
  + [资源](#资源)
  + [配置](#配置)
  + [日志](#日志)
  + [响应](#响应)
  + [异常处理](#异常处理)
  + [TypeScript](#typescript)
  + [EvpConfig](#evpconfig)

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

| 命令 | 用途 |
| --- | --- |
| `-v`、`--version` | 显示 CLI 版本。 |
| `-i`、`--info` | 显示软件包信息。 |
| `-h`、`--help` | 显示命令帮助。 |
| `new <projectName>` | 交互式创建 Express 4 项目。 |
| `show` | 列出可用模板和开发工具。 |
| `start` | 从生成项目的根目录启动服务。 |
| `clean <path>` | 删除当前工作目录下指定的目录及其内容。加 `--list` 可列出已删除的条目。 |
| `add <name>` | 为当前项目添加模板或开发工具。 |

`add` 安装所选依赖、创建缺少的模板文件，并向 `assets/config.yaml` 补充缺少的顶层配置项。已有配置段、源码和 SQL 脚本会保留。给现有项目追加服务模板时，需要在 `src/init.js` 或 `src/init.ts` 中接入初始化。例如，在 JavaScript 的初始化函数中加入 `await require('./utils/redisProxy').init();`。TypeScript 项目可从 `./utils/redisProxy` 导入默认导出，再在初始化函数中等待它的 `init()`。Zod 等路由中间件直接挂在需要校验的路由上。

### 新建项目

可以使用 npx 直接运行已发布的 CLI。

```sh
npx evp-express-cli new hello-api
```

本地安装后可用 `npx evp-express new hello-api`，全局安装后可用 `evp-express new hello-api`。

`None` 和 `All` 均须单独选择。模板选 `All` 时会安装两种校验器，并提示在 `websocket`（默认）和 `socketio` 中选择一种实时通信方式。手动选择模板时，两者也最多选择一个。

### 运行

请在生成项目的根目录运行命令。JavaScript 项目可直接启动。

```sh
npm start
```

TypeScript 项目先编译再启动，修改源码后重新编译。

```sh
npm run tsc:build
npm start
```

`npm run restart` 可以一次完成 TypeScript 编译和启动。也可通过本地 CLI 的 `npx evp-express start` 或全局 CLI 的 `evp-express start` 启动。CLI 转发服务的标准输出、错误输出和退出状态。直接使用 Node 时，JavaScript 的命令为 `node src/index.js`，编译后的 TypeScript 为 `node dist/index.js`。

### 模板

以下 JavaScript 示例中的相对路径以 `src/router/` 下的路由文件为起点。可直接在生成的路由文件中使用已有的 `router` 实例。


#### 验证

`src/midwares/valider` 导出 `express-validator`（名为 `validator`）及四种中间件工厂。

| 中间件 | 执行方式 | 错误处理 |
| --- | --- | --- |
| `ValidRace` | 并发 | 返回最早发现的错误，所有链成功后才放行。 |
| `ValidAll` | 并发 | 汇总所有失败链的消息。 |
| `ValidQueue` | 串行 | 遇到首个错误即停止。 |
| `ValidQueueAll` | 串行 | 汇总所有失败链的消息。 |

```js
const { validator, ValidQueue } = require('../midwares/valider');

router.get('/hello', ValidQueue([
  validator.query('name').trim().notEmpty().withMessage('name cannot be empty'),
  validator.query('age').isInt().withMessage('age must be an integer').toInt()
]), (req, res) => {
  res.send(`Hello ${req.query.name}, you are ${req.query.age} years old!`);
});
```

请求 `/hello?age=25` 缺少姓名。默认 HTTP 状态为 200，响应体给出业务错误。

```json
{
  "ok": false,
  "msg": "name cannot be empty",
  "data": null,
  "symbol": -1,
  "type": "Fail"
}
```

#### Zod

使用 Zod 3 的 schema 可校验 `headers`、`params`、`query` 和 `body`。所有配置的部分通过后，从 `res.locals.validated` 中的同名字段读取经过转换、补默认值的结果。原始 `req` 字段仍可读取。校验请求体时先挂载对应的解析器。

```js
const { z } = require('zod');
const { ZodValid } = require('../midwares/zod');
const { Json } = require('../midwares/bodyParser');

router.post('/greetings', Json, ZodValid({
  query: z.object({ count: z.coerce.number().int().min(1).default(1) }),
  body: z.object({ name: z.string().trim().min(1, 'name cannot be empty') })
}), (req, res) => {
  const { query, body } = res.locals.validated;
  res.json({ name: body.name, count: query.count });
});
```

#### 文件上传

`MultiFields(fields, limits)` 用于按路由声明允许的文件字段。接收的文件在 `req.files` 中按字段名分组。白名单作用于文件字段，普通文本字段保存在 `req.body` 中。

```js
const { MultiFields } = require('../midwares/bodyParser');

router.post('/avatar', MultiFields(
  [{ name: 'avatar', maxCount: 1 }],
  { fileSize: 512 * 1024, files: 1 }
), (req, res) => {
  const file = req.files?.avatar?.[0];
  if (!file) return res.sendStatus(400);
  res.json({ size: file.size });
});
```

兼容已有路由的 `Multi` 接受任意文件字段名，`req.files` 仍为数组。两个解析器默认最多接收 4 个文件、每个 5 MiB，最多 32 个文本字段、每个 64 KiB，multipart 部分总数上限为 36。`MultiFields` 的第二个参数可为当前路由覆盖单项限额。

#### 数据库

数据库模板使用 MySQL、mysql2 驱动和 Knex。在路由中可通过 `const { sqlClient } = require('../utils/knex');` 获取应用查询客户端。

在 `assets/config.yaml` 中设置 `database.init.mode`。设为 `always` 时，启动过程先等待 schema 脚本，再等待 data 脚本。未设置路径的步骤会跳过。设为 `never` 时两项均跳过。同一进程共享成功的初始化结果，新进程会重新执行配置的脚本，应编写可重复执行的初始化 SQL。

`runSql` 和 `runSqlFile` 用于受信任的初始化 SQL。使用 MySQL 时，模板通过启用了多语句支持的专用连接将完整脚本交给服务器解析，引号中的分号和注释均可保留。应用处理业务参数时可使用 `sqlClient` 的参数化查询。

#### Redis

在 `assets/config.yaml` 中设置 `redis.host` 和 `redis.port`。需要认证的服务再配置 `redis.password`，默认空字符串表示连接时不提供密码。

在异步路由中可用 `const { client } = await require('../utils/redisProxy').init();` 获取就绪的客户端。启动连接失败时，`init()` 会拒绝。对于已在启动阶段完成初始化的项目，仍可使用 `instance.client`。

#### Auth

认证模板只是安装了 **passport.js** 你需要自行配置。

#### RabbitMQ

模板使用 amqplib。主机、端口、用户名和密码在 `assets/config.yaml` 的 `rabbitmq` 段配置，生成的本地示例使用 guest 账户。`init()` 和 `instance` Promise 共享一次连接尝试，在通道就绪后返回 `{ conn, channel }`。

```js
const rabbit = require('../utils/rabbitmqProxy');

router.post('/greetings/queue', async (req, res) => {
  const { channel } = await rabbit.init();
  await channel.assertQueue('greetings');
  channel.sendToQueue('greetings', Buffer.from('hello', 'utf8'));
  res.sendStatus(202);
});
```

#### Websocket

`websocket` 模板将 ws 服务器挂到应用的 HTTP 服务器。JavaScript 路由可通过 `require('../utils/wsProxy').instance.server` 取得服务端实例。TypeScript 从 `../utils/websocketProxy` 导入默认导出后读取 `proxy.instance.server`。

#### SocketIO

`socketio` 模板让 Socket.IO 和普通 Express 路由共用同一 HTTP 服务器。JavaScript 路由可通过 `require('../utils/socketioProxy').instance.server` 获取 Socket.IO 服务端实例。

#### Nacos

在 `assets/config.yaml` 配置 `nacos.server.host`、`nacos.server.port` 和 `nacos.namespace`。模板以 `app.name` 为服务名，注册的地址和端口取自 `app.host` 与 `app.port`。

在异步代码中使用 `const { client } = await require('../utils/nacosProxy').init();`，可等待 SDK 就绪并完成注册。初始化失败会传给调用方。启动完成后也可使用已有的 `instance.client`。

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

运行 `npm run build` 将可执行文件生成到 `dist/`。指定 Node 16 x64 目标时可使用 `npm run build:win`、`npm run build:linux` 或 `npm run build:macos`。JavaScript 入口为 `src/index.js`。TypeScript 的打包脚本会先编译，再打包 `dist/index.js`。Pkg 会包含项目根目录下的 `assets/**/*`。

#### PM2

PM2 使用生成的 `ecosystem.config.js`。在项目根目录执行 `npx pm2 start ecosystem.config.js` 即可启动。JavaScript 入口为 `src/index.js`。TypeScript 首次启动前先运行 `npm run tsc:build`，PM2 将运行 `dist/index.js`，生成的部署命令也会在重载前重新编译。

### 资源

`assets/` 存放 `config.yaml`、初始化 SQL 等应用资源。生成的服务默认没有挂载静态路由。如需提供公开文件，可将文件放入 `public/`，在 `src/app.js` 中于路由之前挂载该目录。

```js
const config = require('./config').get();
app.use('/static', express.static(config.public));
```

挂载后，`public/logo.png` 的访问路径为 `/static/logo.png`。配置和初始化脚本保留在 `assets/`。

### 配置

编辑项目根目录下的 `assets/config.yaml`。JavaScript 路由可调用 `require('../config').get()` 读取已缓存的配置。TypeScript 从 `../config` 导入默认导出后调用 `get()`。启动过程也会将配置设在 `global.__config` 上。启动前设置环境变量 `PORT` 可覆盖 `app.port`。

### 日志

日志模块位于 `src/utils/logger.js` 或 `src/utils/logger.ts`，级别由 YAML 中的 `log4js.level` 配置。

### 响应

框架设置了一个如下结构的响应体类：
```typescript
class Resp {
  ok: boolean;
  msg: string;
  data: any;
  symbol: number;
  type: string;
}
```
并内置了 ok, fail, bad 三种方法

### 异常处理

错误依次经过 `src/midwares/exhandler` 中的 `exlogger` 和 `excatcher`。普通异常对外返回 `Resp.bad('System Exception')`。响应头已经发送时，中间件将错误委托给后续 Express 错误处理器。

需要对外返回业务错误时，可将下面的内容编码为 `Error` 的消息。`code` 选择响应类型，400 使用 `Resp.fail` 并可带 `symbol`、`data`，500 使用 `Resp.bad`。对外返回的这两类业务错误可以通过 `status` 指定 HTTP 状态，默认是 200。`back: false` 会返回通用系统错误。

```js
throw new Error(JSON.stringify({
  code: 400,
  msg: 'Invalid arguments.',
  symbol: 20000,
  data: { field: 'name' },
  status: 422
}));
```

### TypeScript

`src/types/index.d.ts` 保存应用类型声明。源码放在 `src/` 下，使用 `npm run tsc:build` 将 JavaScript 输出到 `dist/`。`npm start` 运行编译产物，`npm run restart` 一次完成编译和启动。

### EvpConfig

生成的 `evpconfig.json` 将 `lang` 记为 `"JavaScript"` 或 `"TypeScript"`。CLI 追加模板和选取启动入口时会读取这个值。


---

感谢您的使用!😊🥰
