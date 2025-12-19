const dependencies = [
  'express-validator',
];

const valider =
`import validator from 'express-validator';
import logger from '../utils/logger';
import { RequestHandler } from 'express';

/**
 * Validator Race checker
 * @param validChain the valid chain
 * @returns 
 */
export const ValidRace = (validChain: validator.ValidationChain[])=>{
  const handler: RequestHandler  = async (req, res, next) => {
    await Promise.race(validChain.map(validate => validate.run(req)))
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      logger.debug(valires.array());
      const err = new Error(valires.array()[0].msg);
      throw err;
    }
    next();
  };
  return handler;
}

/**
 * Validator All checker
 * @param validChain the valid chain
 * @returns 
 */
export const ValidAll = (validChain: validator.ValidationChain[])=>{
  const handler: RequestHandler = async (req, res, next) => {
    await Promise.all(validChain.map(validate => validate.run(req)))
    const valires = validator.validationResult(req);
    if (!valires.isEmpty()) {
      logger.debug(valires.array());
      const msgs = valires.array().map(item => item.msg);
      const err = new Error(JSON.stringify(msgs));
      throw err;
    }
    next();
  };
  return handler;
}

/**
 * Validator queue one checker
 * @param validChain the valid chain
 * @returns 
 */
export const ValidQueue = (validChain: validator.ValidationChain[])=>{
  const handler: RequestHandler = async (req, res, next) => {
    for (const validate of validChain) {
        const result = await validate.run(req);
        if(!result.isEmpty()){
          logger.debug(result.array());
          const err = new Error(result.array()[0].msg);
          throw err;
        }
    }
    next();
  };
  return handler;
}

/**
 * Validator queue all checker
 * @param validChain the valid chain
 * @returns 
 */
export const ValidQueueAll = (validChain: validator.ValidationChain[])=>{
  const handler: RequestHandler = async (req, res, next) => {
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
  };
  return handler;
}

const validatorHelper = {
  validator,
  ValidRace,
  ValidAll,
  ValidQueue,
  ValidQueueAll
}

export default validatorHelper;
`;

const files = [
  {
    name: 'src/midwares/valider.ts',
    content: valider
  }
];

module.exports = {
  dependencies,
  files,
  initSegments: []
}