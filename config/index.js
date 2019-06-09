const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

const configFile = fs.readFileSync(path.join('./config.yml'), 'utf-8');
const CONFIG = YAML.parse(configFile);

CONFIG.public_path = path.resolve(CONFIG.public_path);

module.exports = Object.freeze(CONFIG);
