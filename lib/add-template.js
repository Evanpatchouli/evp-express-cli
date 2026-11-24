const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function missingConfig(source, defaults) {
  const config = yaml.load(source) ?? {};
  if (typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Expected a YAML mapping in assets/config.yaml');
  }
  const missing = Object.entries(yaml.load(defaults)).filter(([key]) =>
    !Object.prototype.hasOwnProperty.call(config, key)
  );
  return missing.length ? source.trimEnd() + '\n\n' + yaml.dump(Object.fromEntries(missing)) : source;
}

module.exports = function prepareTemplate(root, template) {
  const configPath = path.join(root, 'assets/config.yaml');
  if (template.configYaml) {
    missingConfig(fs.readFileSync(configPath, 'utf8'), template.configYaml);
  }
  return function writeTemplate() {
    for (const { name, content } of template.files || []) {
      const target = path.join(root, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      try {
        fs.writeFileSync(target, content, { flag: 'wx' });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
    if (template.configYaml) {
      const current = fs.readFileSync(configPath, 'utf8');
      const merged = missingConfig(current, template.configYaml);
      if (merged !== current) fs.writeFileSync(configPath, merged);
    }
  };
};
