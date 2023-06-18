const dependencies = [];

const resp =
`class Resp {
  /**@type {number}*/
  code;
  /**@type {string}*/
  msg;
  /**@type {any}*/
  data;
  /**@type {number}*/
  symbol;
  /**@type {string}*/
  type;
  constructor(
      code,msg,data,symbol,type) {
    this.code = code;
    this.msg = msg;
    this.data = data;
    this.symbol = symbol;
    this.type = type;
  }
  static ok(msg, symbol, data){
      const resp = new Resp(200, msg, data, symbol, "Ok");
      return resp;
  }

  static fail(msg, symbol, data){
      const resp = new Resp(400, msg, data, symbol, "Fail");
      return resp;
  }

  static bad(msg){
      const resp = new Resp(500, msg, null, 0, "Bad Request");
      return resp;
  }
}
module.exports = Resp;
`;

module.exports = {
  dependencies,
  name: 'model/resp.js',
  content: resp
}