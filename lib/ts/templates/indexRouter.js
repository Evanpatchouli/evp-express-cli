const index =
`import { Router } from 'express';
import logger from '../utils/logger';
import Resp from '../model/resp';

const router = Router();

router.get('/', (req, res, next) => {
  logger.info('Hello World!');
  res.json(Resp.ok('Hello World!', 1, null));
});

export = router;
`;

module.exports = {
  name: 'src/router/index.ts',
  content: index
}