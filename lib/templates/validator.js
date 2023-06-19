const dependencies = [
  'express-validator',
];

const valider =
`const validator = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validator Race checker
 * @param {validator.ValidationChain[]} validChain 
 * @returns 
 */
 const ValidRace = (validChain)=>{
  return async (req, res, next) => {
    await Promise.race(validChain.map(validate => validate.run(req)))
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      logger.debug(valires.array());
      const err = new Error(valires.array()[0].msg);
      throw err;
    }
    next();
  }
}

/**
 * Validator All checker
 * @param {validator.ValidationChain[]} validChain 
 * @returns 
 */
const ValidAll = (validChain)=>{
  return async (req, res, next) => {
    await Promise.all(validChain.map(validate => validate.run(req)))
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      logger.debug(valires.array());
      const msgs = valires.array().map(item => item.msg);
      const err = new Error(JSON.stringify(msgs));
      throw err;
    }
    next();
  }
}

/**
 * Validator queue one checker
 * @param {validator.ValidationChain[]} validChain 
 * @returns 
 */
 const ValidQueue = (validChain)=>{
  return async (req, res, next) => {
    for (const validate of validChain) {
        const result = await validate.run(req);
        if(!result.isEmpty()){
          logger.debug(result.array());
          const err = new Error(result.array()[0].msg);
          throw err;
        }
    }
    next();
  }
}

/**
 * Validator queue all checker
 * @param {validator.ValidationChain[]} validChain 
 * @returns 
 */
const ValidQueueAll = (validChain)=>{
  return async (req, res, next) => {
    let results = [];
    for (const validate of validChain) {
        const result = await validate.run(req);
        logger.info(result);
        results.push(result);
    }
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      logger.debug(valires.array());
      const msgs = valires.array().map(item => item.msg);
      const err = new Error(JSON.stringify(msgs));
      throw err;
    }
    next();
  }
}

module.exports = {
  validator,
  ValidRace,
  ValidAll,
  ValidQueue,
  ValidQueueAll
}`;

const files = [
  {
    name: 'midwares/valider.js',
    content: valider
  }
];

module.exports = {
  dependencies,
  files,
  initSegments: []
}