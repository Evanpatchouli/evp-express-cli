const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const { createRequire } = require('node:module');
const { execFileSync, execSync } = require('node:child_process');
const createProject = require('../lib/create-project');

async function probe(entry) {
  const fromApp = createRequire(path.join(process.cwd(), 'package.json'));
  const imported = fromApp('./' + entry + '/utils/server');
  const server = imported.default || imported;
  const listening = once(server, 'listening');
  fromApp('./' + entry + '/index');
  await listening;
  try {
    const url = 'http://127.0.0.1:' + server.address().port;
    await new Promise((resolve, reject) => {
      const call = http.get(url, res => {
        let data = '';
        res.setEncoding('utf8').on('data', part => { data += part; });
        res.once('error', reject);
        res.once('end', () => {
          try {
            assert.equal(res.statusCode, 200);
            assert.equal(JSON.parse(data).msg, 'Hello World!');
            resolve();
          } catch (error) { reject(error); }
        });
      });
      call.setTimeout(5000, () => call.destroy(new Error('HTTP request timed out')));
      call.once('error', reject);
    });
    console.log(entry + ' served GET / using Express ' + fromApp('express/package.json').version);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

function verify() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'evp-generated-'));
  const previous = process.cwd();
  const cli = path.join(__dirname, '../bin/cli');
  try {
    process.chdir(root);
    for (const lang of ['js', 'ts']) {
      const typescript = lang === 'ts';
      createProject({
        name: lang, host: '127.0.0.1', port: 0, logLevel: 'ERROR',
        templates: ['validator', 'zod'], devtools: []
      }, typescript);
      const cwd = path.join(root, lang);
      const options = { cwd, stdio: 'inherit' };
      if (typescript) execSync('npm run tsc:build', options);
      execFileSync(process.execPath, [__filename, '--http', typescript ? 'dist' : 'src'], { ...options, timeout: 15000 });
      if (!typescript) {
        execFileSync(process.execPath, [cli, 'add', 'eslint'], options);
        execSync('npm ci', options);
        const fromApp = createRequire(path.join(cwd, 'package.json'));
        assert.ok(fromApp.resolve('eslint/package.json'));
        assert.equal(fromApp('./package.json').scripts.build, undefined);
      }
    }
  } finally {
    process.chdir(previous);
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (process.argv[2] === '--http') {
  probe(process.argv[3]).catch(error => { console.error(error); process.exitCode = 1; });
} else {
  verify();
}
