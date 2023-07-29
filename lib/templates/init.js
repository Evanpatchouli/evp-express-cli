module.exports = {
  name: "src/init.js",
  _body: ["console.log('Initializing the server...');"],
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
    let content = this._top;
    for (const segment of this._body) {
      content += '\n  ' + segment;
    }
    content += '\n' + this._bottom;
    return content;
  },
  files: [],
}