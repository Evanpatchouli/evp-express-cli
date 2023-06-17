const indenx =
`const { Router } = require('express');
const logger = require('../utils/logger');

const router = new Router();

router.get('/', (req, res) => {
  logger.info('Hello World!');
  res.send('Hello World!');
});

module.exports = router;
`;

module.exports = {
  name: 'router/index.js',
  content: indenx
}