const dependencies = [];

const resp =
`class Resp {
  /**@type {boolean}*/
  ok;
  /**@type {string}*/
  msg;
  /**@type {any}*/
  data;
  /**@type {number}*/
  symbol;
  /**@type {string}*/
  type;
  /**
   * 
   * @param {boolean} ok @param {string} msg 
   * @param {any} data @param {number} symbol 
   * @param {string} type 
   */
  constructor(
    ok,msg,data,symbol,type) {
    this.ok = ok;
    this.msg = msg;
    this.data = data;
    this.symbol = symbol;
    this.type = type;
  }

  /**@param {string} msg @param {number} symbol */
  static ok(msg, symbol, data){
    const resp = new Resp(true, msg, data, symbol, "Ok");
    return resp;
  }

  /**@param {string} msg @param {number} symbol */
  static fail(msg, symbol, data){
    const resp = new Resp(false, msg, data, symbol, "Fail");
    return resp;
  }

  /**@param {string} msg */
  static bad(msg){
    const resp = new Resp(false, msg, null, 0, "Bad Request");
    return resp;
  }
}

module.exports = Resp;
`;

module.exports = {
  dependencies,
  name: 'src/model/resp.js',
  content: resp
}