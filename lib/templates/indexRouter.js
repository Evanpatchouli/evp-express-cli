const index =
`const { Router } = require('express');
const logger = require('../utils/logger');
const Resp = require('../model/resp');

const router = Router();

router.get('/', (req, res, next) => {
  logger.info('Hello World!');
  res.json(Resp.ok('Hello World!', 1, null));
});

module.exports = router;
`;

module.exports = {
  name: 'router/index.js',
  content: index
}