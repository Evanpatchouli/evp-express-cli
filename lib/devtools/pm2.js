const dependencies = [
  'pm2 -D'
];

const ecosystemConfig =
`module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
`

const files = [
  {
    name: 'ecosystem.config.js',
    content: ecosystemConfig
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