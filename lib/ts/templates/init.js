module.exports = {
  name: "src/init.ts",
  _body: ["\nexport default async function init() {\n  console.log('Initializing the server...');"],
  _top: [],
  _bottom: "}",
  /**
   * @param {string[]} importSegments 
   * @param {string[]} initSegments 
   */
  put: function(importSegments, initSegments) {
    this._top.push(...importSegments);
    this._body.push(...initSegments);
  },
  content: function() {
    let content = "require('express-async-errors');";
    for (const segment of this._top) {
      content += '\n' + segment;
    }
    for (const segment of this._body) {
      content += '\n  ' + segment;
    }
    content += '\n' + this._bottom;
    return content;
  },
  files: [],
}