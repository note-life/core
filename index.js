const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const Koa = require('koa');
const koaBody = require('koa-body');
const KoaStatic = require('koa-static');
const logger = require('koa-logger');
const schedule = require('node-schedule');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/error-handler');
const blacklist = require('./middleware/black-list');
const router = require('./routes');
const backup = require('./scripts/backup');
const { connectToMongoose, tokenSecret } = require('./utils');
const CONFIG = require('./config');

const app = new Koa();

process.env.NODE_ENV === 'development' && app.use(logger());

app.context._TOKEN_SECRET = tokenSecret();
app.context._ICU_ACCOUNTS = [];
app.context.revokedTokens = [];
app.context.verificationCodes = [];

app.proxy = true;

app.use(async (ctx, next) => {
    ctx.set('Powered-By', 'node.life');
    await next();
});
app.use(errorHandler);
app.use(cors());
app.use(blacklist);
app.use(connectToMongoose);
app.use(koaBody({
    multipart: true,
    maxFieldsSize: 1024 * 1024 * 4
}));
app.use(KoaStatic(CONFIG.public_path));
app.use(router.routes());
app.use((ctx) => {
    ctx.status = 404;
    ctx.body = {
        error: {
            type: 'resource_error',
            message: `not found: ${ctx.url}`
        }
    };
});

const startCallback = (type = 'http') => {
    console.log(`🐣 🐥 note.life.core ${type} server run at ${type === 'http' ? CONFIG.bind_port : CONFIG.ssl_bind_port} port...`);
};

if (CONFIG.https) {
    const options = {
        cert: fs.readFileSync(path.join(CONFIG.ssl_certificate)),
        key: fs.readFileSync(path.join(CONFIG.ssl_certificate_key))
    };

    https.createServer(options, app.callback()).listen(CONFIG.ssl_bind_port, CONFIG.bind_port, startCallback.bind(null, 'https'));
}

http.createServer(app.callback()).listen(CONFIG.bind_port, CONFIG.bind_port, startCallback);


// 每天凌晨 03:03:03 更换 token secret & reset ICU accounts
schedule.scheduleJob('3 3 3 * * *', () => {
    app.context._TOKEN_SECRET = tokenSecret();
    app.context._ICU_ACCOUNTS = [];
    console.log(`${Date.now()}: token secret changed`);
});

// 每周一的凌晨 02:02:02 对数据库做备份
schedule.scheduleJob('2 2 2 * * 1', () => {
    backup();
    console.log(`${Date.now()}: db backup`);
});
