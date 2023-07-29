module.exports = {
  name: 'index.d.ts',
  content:
`declare type ErrorStrategyArgs = [
  string,
  number | undefined,
  any,
  number | undefined
];

declare interface EvpErrorHandler {
  (
    err: Error,
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ): void;
}

declare type EvpZodError = {
  code: string;
  expected: string;
  received: any;
  path: string[];
  message: string;
}

declare interface EvpConfig {
  app: { name; host: string; port: number };
  assets: string;
  public: string;
  private: string;
  log4js: { level: string };
  database: {
    host: string;
    port: number;
    client: string;
    driver: string;
    database: string;
    user: string;
    password: string;
    init: { mode: string; schema: string; data: string };
  };
  redis: { host: string; port: string; password: string };
  rabbitmq: { host: string; port: number; user: string; password: string };
  nacos: { server: { host: string; port: number }; namespace: string };
}

declare interface ZodValid {
  (
    props: 
    {headers?: import("zod").AnyZodObject, 
    params?: import("zod").AnyZodObject, 
    query?: import("zod").AnyZodObject, 
    body?: import("zod").AnyZodObject}
  ): import("express").RequestHandler
}

declare let __config: EvpConfig;

`
}