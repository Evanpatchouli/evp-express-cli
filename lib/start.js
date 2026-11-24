const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

module.exports = function start(cwd) {
  const config = path.join(cwd, 'evpconfig.json');
  const lang = fs.existsSync(config) ? JSON.parse(fs.readFileSync(config, 'utf8')).lang : 'JavaScript';
  const entry = lang.toLowerCase() === 'typescript' ? 'dist/index.js' : 'src/index.js';
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entry], { cwd, stdio: 'inherit' });
    const interrupt = () => child.kill('SIGINT');
    const terminate = () => child.kill('SIGTERM');
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', terminate);
    child.once('error', reject);
    child.once('close', (code, signal) => {
      process.removeListener('SIGINT', interrupt);
      process.removeListener('SIGTERM', terminate);
      process.exitCode = code ?? (128 + (os.constants.signals[signal] || 0));
      resolve();
    });
  });
};
