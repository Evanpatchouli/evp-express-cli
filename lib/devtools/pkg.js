const dependencies = [
  'pkg -D'
];

const files = [];

function updPkgJson(jsonObj) {
  jsonObj["scripts"]["build"] = "npx pkg . --out-path dist";
  jsonObj["scripts"]["build:win"] = "npx pkg . --out-path dist -t node16-win-x64";
  jsonObj["scripts"]["build:linux"] = "npx pkg . --out-path dist -t node16-linux-x64";
  jsonObj["scripts"]["build:macos"] = "npx pkg . --out-path dist -t node16-macos-x64";
  jsonObj["main"] = "./src/index.js";
  jsonObj["bin"] = "./src/index.js";
  jsonObj["pkg"] = {
    "assets": [
      "src/assets/**/*"
    ]
  }
  return jsonObj;
}

module.exports = {
  dependencies,
  files,
  updPkgJson
}