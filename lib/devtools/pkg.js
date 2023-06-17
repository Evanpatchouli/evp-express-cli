const dependencies = [
  'pkg -D'
];

const files = [];

function updPkgJson(jsonObj) {
  jsonObj["scripts"]["build"] = "npx pkg . --out-path dist -t node16-win-x64";
  jsonObj["bin"] = "./index.js";
  jsonObj["pkg"] = {
    "assets": [
      "assets/**/*"
    ]
  }
  return jsonObj;
}

module.exports = {
  dependencies,
  files,
  updPkgJson
}