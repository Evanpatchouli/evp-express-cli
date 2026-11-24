const zod = `import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

const parts = ['headers', 'params', 'query', 'body'] as const;
type Part = typeof parts[number];

export function ZodValid(schemas: Partial<Record<Part, ZodTypeAny>>): RequestHandler {
  return (req, res, next) => {
    const parsed: Partial<Record<Part, unknown>> = {};
    for (const part of parts) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const msg = result.error.issues[0]?.message ?? 'Invalid request';
        return next(new Error(JSON.stringify({ code: 400, msg })));
      }
      parsed[part] = result.data;
    }
    res.locals.validated = { ...res.locals.validated, ...parsed };
    next();
  };
}

export default { ZodValid };
`;

module.exports = {
  dependencies: ['zod@3'],
  files: [{ name: 'src/midwares/zod.ts', content: zod }],
  importSegments: [],
  initSegments: []
};
