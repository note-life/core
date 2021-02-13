const Mongoose = require('mongoose');
const CONFIG = require('../config');

Mongoose.Promise = global.Promise;
Mongoose.set('useCreateIndex', true);

let mongooseConnected = false;

// process.on('uncaughtException', (err) => {
//     if (err.name === 'MongoError') {
//         Mongoose.connection.emit('error', err);
//     } else {
//         process.exit(0);
//     }
// });

// Mongoose.connection.on('error', (err, tp) => {
//     console.log(err.message)
// });

/**
 * mongoose 连接路径
 * 
 * @param {Object} option
 * @returns 
 */
function _connPath(option) {
    const { auth, username, password, host, port, name } = option;

    let authStr = '';

    if(auth) {
        authStr = `${username}:${password}@`;
    }

    return `mongodb://${authStr}${host}:${port}/${name}`;
}

/**
 * 连接 mongoose
 */
async function connectToMongoose (ctx, next) {
    const config = {
        auth: CONFIG.db_auth,
        username: CONFIG.db_user,
        password: CONFIG.db_pass,
        host: CONFIG.db_host,
        port: CONFIG.db_port,
        name: CONFIG.db_name,
    };

    if (mongooseConnected) {
        await next();
        return;
    }

    const invalidChars = [' ', '.', '$', '/', '\\'];
    const result = CONFIG.db_name.split('').filter(char => invalidChars.indexOf(char) > -1);
    
    if (result.length > 0) {
        ctx.throw(401, {
            type: 'validation_error',
            message: `db name can not contain those chars: ${result}`
        });
    }

    await Mongoose.connection.close();
    await Mongoose.connect(_connPath(config), { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    mongooseConnected = true;
    await next();
}

module.exports = connectToMongoose;
