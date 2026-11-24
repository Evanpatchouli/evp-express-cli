const dependencies = [
  'pkg -D'
];

const files = [];

function updPkgJson(jsonObj) {
  jsonObj["scripts"]["build"] = "npm run tsc:build && npx pkg . --out-path dist";
  jsonObj["scripts"]["build:win"] = "npm run tsc:build && npx pkg . --out-path dist -t node16-win-x64";
  jsonObj["scripts"]["build:linux"] = "npm run tsc:build && npx pkg . --out-path dist -t node16-linux-x64";
  jsonObj["scripts"]["build:macos"] = "npm run tsc:build && npx pkg . --out-path dist -t node16-macos-x64";
  jsonObj["main"] = "./dist/index.js";
  jsonObj["bin"] = "./dist/index.js";
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
