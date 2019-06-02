import path from 'path';
import fs from 'fs';
import YAML from 'yaml';

const configFile = fs.readFileSync(path.join('./config.yml'), 'utf-8');
const CONFIG = YAML.parse(configFile);

CONFIG.public_path = path.resolve(CONFIG.public_path);

export default Object.freeze(CONFIG);