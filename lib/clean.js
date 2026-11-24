const fs = require('fs');
const path = require('path');

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
}

module.exports = function clean(cwd, folder, report) {
  const root = fs.realpathSync(cwd);
  const target = path.resolve(root, folder);
  if (target === root || !inside(root, target) ||
      !inside(root, fs.realpathSync(path.dirname(target)))) {
    throw new Error('Choose a directory inside the current working directory.');
  }
  function remove(entry) {
    const stat = fs.lstatSync(entry);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      for (const name of fs.readdirSync(entry)) remove(path.join(entry, name));
      fs.rmdirSync(entry);
    } else {
      fs.unlinkSync(entry);
    }
    if (report) report(entry);
  }
  const stat = fs.lstatSync(target);
  if (!stat.isDirectory() && !stat.isSymbolicLink()) throw new Error('Expected a directory.');
  remove(target);
};
