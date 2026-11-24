const zod = `const parts = ['headers', 'params', 'query', 'body'];

/** @param {Partial<Record<'headers'|'params'|'query'|'body', import('zod').ZodTypeAny>>} schemas */
function ZodValid(schemas) {
  return (req, res, next) => {
    const parsed = {};
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

module.exports = { ZodValid };
`;

module.exports = {
  dependencies: ['zod@3'],
  files: [{ name: 'src/midwares/zod.js', content: zod }],
  importSegments: [],
  initSegments: []
};
