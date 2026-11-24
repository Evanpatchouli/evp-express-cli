const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { templates, devtools, normalizeSelection } = require('./registry');
const { applyDependencies } = require('./dependencies');

function renderProject(answers, typescript, projectName) {
  const selectedTemplates = normalizeSelection(answers.templates, templates, answers.transport);
  const selectedTools = normalizeSelection(answers.devtools, devtools);
  const base = typescript ? './ts/' : './';
  const template = name => require(base + 'templates/' + name);
  const tools = selectedTools.map(name => require(base + 'devtools/' + name));
  const log = template('log4js');
  const components = [
    template('index'), template('indexRouter'), template('bodyParser'), template('resp'),
    template('app'), template('server'), template('config'), template('exhandler'),
    new log(answers), ...selectedTemplates.map(template)
  ];
  const scripts = {
    test: 'echo "Error: no test specified" && exit 1',
    start: typescript ? 'node dist/index' : 'node src/index'
  };
  const specs = ['evp-express-cli -D', 'express@4', '@types/express@4 -D', 'js-text-chart', 'js-yaml', 'log4js'];
  const files = new Map();
  if (typescript) {
    scripts['tsc:build'] = 'tsc --outDir dist';
    scripts.restart = 'npm run tsc:build && npm start';
    specs.push('@types/js-yaml -D', '@types/node -D');
    components.push(template('tsconfig'));
    files.set('src/types/index.d.ts', template('type').content);
  }
  let manifest = {
    name: projectName,
    version: '1.0.0',
    description: 'A evp-express-cli project',
    main: typescript ? 'dist/index.js' : 'src/index.js',
    scripts,
    engines: { node: '>=16.17.0' },
    license: 'ISC'
  };
  const port = Number(answers.port);
  if (String(answers.port).trim() === '' || !Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('Port must be an integer between 0 and 65535.');
  }
  const yaml = [
    'app:', '  name: ' + JSON.stringify(answers.name), '  host: ' + JSON.stringify(answers.host),
    '  port: ' + port, 'assets: default', 'public: default', ''
  ];
  const initTemplate = template('init');
  // Each project owns its imports and statements, including when a process creates multiple projects.
  const init = { ...initTemplate, _body: [...initTemplate._body] };
  if (typescript) init._top = [...initTemplate._top];
  for (const component of [...components, ...tools]) {
    if (component.name) files.set(component.name, component.content);
    for (const file of component.files || []) files.set(file.name, file.content);
    specs.push(...(component.dependencies || []));
    if (component.configYaml) yaml.push(component.configYaml);
    if (component.initSegments) {
      if (typescript) init.put(component.importSegments || [], component.initSegments);
      else init.put(component.initSegments);
    }
  }
  for (const tool of tools) manifest = tool.updPkgJson(manifest);
  applyDependencies(manifest, specs);
  files.set(init.name, init.content());
  files.set('assets/config.yaml', yaml.join('\n'));
  files.set('package.json', JSON.stringify(manifest, null, 2) + '\n');
  files.set('evpconfig.json', JSON.stringify({ lang: typescript ? 'TypeScript' : 'JavaScript' }, null, 2) + '\n');
  files.set('.gitignore', 'node_modules\ndist\ncoverage\n');
  return files;
}

function installDependencies(cwd) {
  execSync('npm install', { cwd, stdio: 'inherit' });
}

module.exports = function createProject(answers, typescript, install = installDependencies) {
  const target = path.resolve(process.cwd(), answers.name);
  if (fs.existsSync(target)) throw new Error(`Project "${answers.name}" already exists.`);
  const packageName = path.basename(target).toLowerCase().replace(/\s+/g, '-');
  if (!/^[a-z0-9~-][a-z0-9._~-]*$/.test(packageName) || ['node_modules', 'favicon.ico'].includes(packageName)) {
    throw new Error('Choose a project directory name that can also be used as an npm package name.');
  }
  const files = renderProject(answers, typescript, packageName);
  const staging = fs.mkdtempSync(path.join(path.dirname(target), '.evp-create-'));
  try {
    for (const dir of ['public', 'private', 'assets', 'src/test', 'src/utils', 'src/model', 'src/router', 'src/midwares']) {
      fs.mkdirSync(path.join(staging, dir), { recursive: true });
    }
    for (const [name, content] of files) {
      const file = path.join(staging, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, { flag: 'wx' });
    }
    console.log('Installing project dependencies...');
    install(staging);
    if (fs.existsSync(target)) throw new Error(`Project "${answers.name}" already exists.`);
    fs.renameSync(staging, target);
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
  console.log(`Created ${answers.name}.\n$ cd ${answers.name}\n$ npm run ${typescript ? 'restart' : 'start'}`);
};
