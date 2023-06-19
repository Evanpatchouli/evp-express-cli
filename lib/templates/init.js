module.exports = {
  name: "init.js",
  _body: ["require('./config')();"],
  _top: 
`module.exports = async function() {`,
  _bottom: "}",
  /**
   * 
   * @param {string[]} segments 
   */
  put: function(segments) {
    this._body.push(...segments);
  },
  content: function() {
    let contet = this._top;
    for (const segment of this._body) {
      contet += '\n  ' + segment;
    }
    contet += '\n' + this._bottom;
    return contet;
  },
  files: [],
}