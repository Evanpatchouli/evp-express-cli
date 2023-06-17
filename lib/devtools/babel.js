const dependencies = [
  '@babel/cli -D', '@babel/core -D', '@babel/preset-env -D'
];

const config = 
`module.exports = {
  presets: ["@babel/env"],
  plugins: []
}
`;

const files = [
  {
    name: "babel.config.js",
    content: config
  }
];

function updPkgJson(jsonObj) {
  return jsonObj;
}

module.exports = {
  dependencies,
  files,
  updPkgJson
}