const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const CONFIG = require('../config');

const { execSync, exec } = child_process;

function num (num) {
    if (num < 10) return `0${num}`;

    return `${num}`;
}

function clear () {
    const backupPath = path.join('./.backup');
    const dir = fs.readdirSync(backupPath);
    const allTarFiles = dir.filter(v => /\.tar\.gz/.test(v));
    const tarFiles = allTarFiles.slice(-2);

    allTarFiles.forEach(file => {
        if (!tarFiles.includes(file)) {
            execSync(`rm ${backupPath}/${file}`);
            console.log(`ok: rm ${backupPath}/${file}`);
        }
    });
}


function backup () {
    clear();

    const date = new Date();
    const dirName = `${date.getFullYear()}_${num(date.getMonth() + 1)}_${num(date.getDate())}_${num(date.getHours())}${num(date.getMinutes())}${num(date.getSeconds())}`;
    const backupPath = `./.backup/${dirName}`;
    const tarFile = `${dirName}.tar.gz`;
    const command = `mongodump -h 127.0.0.1 -d ${CONFIG.db_name} -o ${backupPath} && tar -zcvf ${tarFile} ${backupPath} && mv ${tarFile} ./.backup && rm -rf ${backupPath}`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            throw(err);
        }
    });
}


module.exports = backup;

/**
## 解压

```bash
tar -tf <filename>.tar.gz
```

## 恢复

```bash
mongorestore -h 127.0.0.1:27017 -d note_life <path>
```
 */
