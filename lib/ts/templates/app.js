const app =
`import express from 'express';
import router from './router/index';
import { excatcher, exlogger } from './midwares/exhandler';

const app = express();

app.use('/', router);

app.use(excatcher);

app.use(exlogger);

export default app;

`;

module.exports = {
  name: 'src/app.ts',
  content: app
}