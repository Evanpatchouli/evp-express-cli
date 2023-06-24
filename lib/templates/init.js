module.exports = {
  name: "src/init.js",
  _body: ["console.log('Initializing the server...');\n  await require('./config').init();"],
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