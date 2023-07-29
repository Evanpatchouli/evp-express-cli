const dependencies = [
  'zod',
];

const zod =
`import { z } from "zod";
import { RequestHandler } from "express";

function selFirstError(errors: z.ZodError) {
  const errs: EvpZodError[] = JSON.parse(errors as unknown as string);
  return errs[0];
}

const ZodValid: ZodValid = ({headers, params, query, body})=>{
  const handler: RequestHandler = (req, res, next)=>{
    if (headers) {
      const result = headers.safeParse(req.headers);
      if (!result.success) {
        throw new Error(selFirstError(result.error).message)
      }
    }
    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        throw new Error(selFirstError(result.error).message)
      }
    }
    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        throw new Error(selFirstError(result.error).message)
      }
    }
    if (body) {
      console.log(req.body);
      const result = body.safeParse(req.body);
      if (!result.success) {
        throw new Error(selFirstError(result.error).message)
      }
    }
    next();
  }
  return handler;
}

export = {
  ZodValid
}

`;

const files = [
  {
    name: 'src/midwares/zod.ts',
    content: zod
  }
];

module.exports = {
  dependencies,
  files,
  importSegments: [],
  initSegments: []
}