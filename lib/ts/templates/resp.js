const dependencies = [];

const resp =
`class Resp{
  ok: boolean;
  msg: string;
  data: any;
  symbol: number;
  type: string;

  constructor(
    ok: boolean,msg: string,data: any,symbol: number,type: string) {
    this.ok = ok;
    this.msg = msg;
    this.data = data;
    this.symbol = symbol;
    this.type = type;
  }

  static ok(msg: string, symbol?: number|null, data?: any) {
    const resp = new Resp(true, msg, data??null, symbol??1, "Ok");
    return resp;
  };

  static fail(msg: string, symbol?: number|null, data?: any) {
    const resp = new Resp(false, msg, data??null, symbol??-1, "Fail");
    return resp;
  };

  static bad(msg: string) {
    const resp = new Resp(false, msg, null, 0, "Bad Request");
    return resp;
  };
}

export = Resp;
`;

module.exports = {
  dependencies,
  name: 'src/model/resp.ts',
  content: resp
}