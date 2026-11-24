# evp-express-cli

<p>
  <a href="https://www.npmjs.com/package/evp-express-cli"><img alt="npmpackage" src="https://badge.fury.io/js/evp-express-cli.svg"></a>
  <a href="https://nodejs.org/en"><img alt="nodejs" src="https://img.shields.io/badge/NodeJS-16.17+-black.svg"></a>
  <a href="https://www.npmjs.com/package/express"><img alt="express" src="https://img.shields.io/badge/Express-4.x-%23007fff.svg"></a>
</p>

[![Security Status](https://www.murphysec.com/platform3/v31/badge/1671461396351311872.svg)](https://www.murphysec.com/console/report/1671461396074487808/1671461396351311872)


Generate an Express 4 application in JavaScript or TypeScript. The interactive CLI configures logging and adds the service integrations and development tools you select.

Change language: [中文文档](./README_CN.md) | [English Doc](./README.md)

## News

**Latest 5 versions reports:**

**v1.2.3**
1. fix: `knex.js` init
2. fix: set `express` version to v4.

**v1.2.2**
1. New feature: `SET PORT=<port number>` before `npm start` is supported

**v1.2.1**
1. fix config init bug
2. update `show` command

**v1.2.0**
1. support TypeScript
2. provide zod template

**v1.1.1**
1. provide websocket template

## Documentation

- [Installation](#install)
- [Usages](#usages)
  + [command](#command)
  + [Create new project](#create-new-project)
  + [Running](#running)
  + [Templates](#templates)
    * [Validator](#validator)
    * [Zod](#zod)
    * [Multipart uploads](#multipart-uploads)
    * [Database](#database)
    * [Redis](#redis)
    * [Auth](#auth)
    * [RabbitMQ](#rabbitmq)
    * [Websocket](#websocket)
    * [SocketIO](#socketio)
    * [Nacos](#nacos)
  + [DevTools](#devtools)
    * [Babel](#babel)
    * [ESLint](#eslint)
    * [Jest](#jest)
    * [Pkg](#pkg)
    * [PM2](#pm2)
  + [Assets](#assets)
  + [Config](#config)
  + [Logger](#logger)
  + [Response](#response)
  + [ExHandler](#exhandler)
  + [TypeScript](#typescript)
  + [EvpConfig](#evpconfig)

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

| Command | Behavior |
| --- | --- |
| `-v`, `--version` | Print the CLI version. |
| `-i`, `--info` | Show package information. |
| `-h`, `--help` | Show command help. |
| `new <projectName>` | Create an Express 4 project interactively. |
| `show` | List available templates and development tools. |
| `start` | Run the generated project's entry point from its root directory. |
| `clean <path>` | Remove the specified directory within the working directory, including its contents. Use `--list` to print removed entries. |
| `add <name>` | Add a template or development tool to the current project. |

`add` installs the selected dependencies, creates missing template files and appends missing top-level sections to `assets/config.yaml`. It preserves existing configuration sections, source files and SQL scripts. When adding a service to an existing project, enable its startup call in `src/init.js` or `src/init.ts`. For example, add `await require('./utils/redisProxy').init();` inside the JavaScript initializer. In TypeScript, import the default Redis proxy from `./utils/redisProxy` and await its `init()` there. Route middleware such as Zod is attached where a route needs it.

### Create new project

Run the published CLI directly with npx.

```sh
npx evp-express-cli new hello-api
```

With a local installation, use `npx evp-express new hello-api`. With a global installation, use `evp-express new hello-api`.

Select `None` or `All` on its own. Selecting all templates includes both validators and prompts you to choose one realtime transport, `websocket` (the default) or `socketio`. When selecting individual templates, choose at most one of these transports.

### Running

Run commands from the generated project directory. JavaScript starts directly.

```sh
npm start
```

For TypeScript, compile first. Run the build again after changing the source.

```sh
npm run tsc:build
npm start
```

`npm run restart` compiles and starts a TypeScript project in one command. You can also use `npx evp-express start` (local CLI) or `evp-express start` (global CLI). The CLI forwards server output, errors and exit status. The direct Node entries are `node src/index.js` for JavaScript and `node dist/index.js` for compiled TypeScript.

### Templates

The JavaScript snippets below use paths relative to a router in `src/router/`. In the generated router file, register routes on its existing `router` instance.


#### Validator

The generated `src/midwares/valider` module exposes `express-validator` as `validator` and four middleware factories.

| Middleware | Chain execution | Failure response |
| --- | --- | --- |
| `ValidRace` | Concurrent | First detected failure. Success waits for every chain. |
| `ValidAll` | Concurrent | Messages from all failing chains. |
| `ValidQueue` | In order | First failure, with subsequent chains skipped. |
| `ValidQueueAll` | In order | Messages from all failing chains. |

```js
const { validator, ValidQueue } = require('../midwares/valider');

router.get('/hello', ValidQueue([
  validator.query('name').trim().notEmpty().withMessage('name cannot be empty'),
  validator.query('age').isInt().withMessage('age must be an integer').toInt()
]), (req, res) => {
  res.send(`Hello ${req.query.name}, you are ${req.query.age} years old!`);
});
```

A request to `/hello?age=25` has no name. The default HTTP status is 200 and the response body identifies the validation failure.

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

Use Zod 3 schemas to validate `headers`, `params`, `query` or `body`. After every configured section succeeds, read parsed values from `res.locals.validated` under the matching section names. These values include defaults, coercions and transforms. The original `req` fields remain available. Mount the appropriate body parser before `ZodValid`.

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

#### Multipart uploads

Use `MultiFields(fields, limits)` for routes that accept named file fields. It places the accepted files in `req.files`, grouped by field name. The list applies to file fields. Text fields are available under `req.body`.

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

The existing `Multi` middleware accepts any file field name and keeps `req.files` as an array. Both parsers default to 4 files of up to 5 MiB each, 32 text fields of up to 64 KiB each, and 36 multipart parts in total. The second argument to `MultiFields` overrides individual limits for that route.

#### Database

The database template uses MySQL, the mysql2 driver and Knex. From a router, use `const { sqlClient } = require('../utils/knex');` for application queries.

Set `database.init.mode` in `assets/config.yaml`. With `always`, startup waits for the configured schema script and then the data script. A missing script setting skips that step. With `never`, startup skips both. Successful initialization is shared within one process. A new process runs the configured scripts again, so write repeatable bootstrap SQL.

`runSql` and `runSqlFile` accept trusted bootstrap SQL. For MySQL they send the complete script to the server on a dedicated connection with multiple statements enabled, preserving quoted semicolons and comments. For application data, pass parameters to Knex queries on `sqlClient`.

#### Redis

Set `redis.host`, `redis.port` and, for a password-protected server, `redis.password` in `assets/config.yaml`. The default empty password selects a connection without authentication.

From an async route, use `const { client } = await require('../utils/redisProxy').init();`. Initialization resolves when the connection is ready and rejects if startup fails. The existing `instance.client` accessor remains available to projects that complete initialization at startup.

#### Auth

The Auth Template only installs the package **passport.js** and you should customize it by yourself.

#### RabbitMQ

The template uses amqplib. Configure the host, port, user and password under `rabbitmq` in `assets/config.yaml`. The generated local defaults use the guest account. `init()` and the `instance` promise share the same connection attempt and resolve with `{ conn, channel }` once the channel is ready.

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

The `websocket` template attaches a ws WebSocket server to the application's HTTP server. In a JavaScript router, access it with `require('../utils/wsProxy').instance.server`. In TypeScript, import the default proxy from `../utils/websocketProxy` and read `proxy.instance.server`.

#### SocketIO

The `socketio` template serves Socket.IO and ordinary Express routes on the same HTTP server. In a JavaScript router, access the Socket.IO server with `require('../utils/socketioProxy').instance.server`.

#### Nacos

Configure `nacos.server.host`, `nacos.server.port` and `nacos.namespace` in `assets/config.yaml`. The template uses `app.name` as the Nacos service name and registers `app.host` and `app.port`.

From async code, `const { client } = await require('../utils/nacosProxy').init();` waits for SDK readiness and registration. Initialization failures propagate to the caller. The existing `instance.client` accessor is also available after startup.

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

Run `npm run build` to create executables in `dist/`. The explicit Node 16 x64 targets are `npm run build:win`, `npm run build:linux` and `npm run build:macos`. The JavaScript entry is `src/index.js`. TypeScript build scripts compile first and package `dist/index.js`. Pkg includes the project-root `assets/**/*`.

#### PM2

PM2 uses the generated `ecosystem.config.js`. Run `npx pm2 start ecosystem.config.js` in the project root. JavaScript uses `src/index.js`. For TypeScript, run `npm run tsc:build` before the first start. PM2 runs `dist/index.js`, and its generated deployment command rebuilds before reloading.

### Assets

`assets/` holds application inputs such as `config.yaml` and SQL initialization scripts. The generated server has no static route by default. To serve files, place them in `public/` and mount that directory in `src/app.js` before the routers.

```js
const config = require('./config').get();
app.use('/static', express.static(config.public));
```

With this mount, `public/logo.png` is available at `/static/logo.png`. Keep configuration and initialization scripts in `assets/`.

### Config

Edit `assets/config.yaml` in the project root. From a JavaScript router, call `require('../config').get()` to read the cached configuration. In TypeScript, import the default config module from `../config` and call `get()`. Startup also exposes it as `global.__config`. Set the `PORT` environment variable before starting the process to override `app.port`.

### logger

The generated logger is in `src/utils/logger.js` or `src/utils/logger.ts`. Set its level with `log4js.level` in the YAML configuration.

### Response

Framework set a Resp of this：
```typescript
class Resp {
  ok: boolean;
  msg: string;
  data: any;
  symbol: number;
  type: string;
}
```
Resp provides three builder methods of ok, fail, bad.

### Exhandler

Express errors pass through `exlogger` and then `excatcher` in `src/midwares/exhandler`. A plain error returns `Resp.bad('System Exception')`. If headers have already been sent, the handler delegates to the next Express error handler.

To return a business error, encode the following payload in an `Error`. The `code` field selects the response builder. Code 400 uses `Resp.fail` with optional `symbol` and `data`. Code 500 uses `Resp.bad`. The optional `status` sets the HTTP status for these public errors. It defaults to HTTP 200. Setting `back: false` returns the generic system response.

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

Application declarations live in `src/types/index.d.ts`. Edit source files under `src/`. Run `npm run tsc:build` to emit JavaScript into `dist/`, `npm start` to run that build, or `npm run restart` to build and start together.

### EvpConfig

The generated `evpconfig.json` records `lang` as `"JavaScript"` or `"TypeScript"`. The CLI uses this value when adding templates and selecting the startup entry.

---

Thanks for using!😊🥰
