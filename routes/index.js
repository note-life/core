const JWT = require('jsonwebtoken');
const Router = require('koa-router');

const summary = require('./summary');
const note = require('./note');
const user = require('./user');
const configuration = require('./configuration');
const setup = require('./setup');
const verification = require('./verification');
const upload = require('./upload');
const tag = require('./tag');
const archive = require('./archive');

const router = new Router();

router.use(async function (ctx, next) {
    const userToken = ctx.request.header.ut;
    const { method, url } = ctx.request;

    if (ctx.revokedTokens.includes(userToken)) {
        ctx.throw(401, {
            type: 'authentication_error',
            message: 'verification has expired'
        });
    }

    if (userToken) {
        ctx.request.signinedUser = JWT.verify(userToken, ctx._TOKEN_SECRET);
    }

    if (!userToken && method !== 'GET' && !['/setup/admin', '/users/authenticate', '/users/forget'].includes(url)) {
        ctx.throw(403);
    }

    await next();
});

router.use('/notes', note.routes());
router.use('/users', user.routes());
router.use('/configurations', configuration.routes());
router.use('/setup', setup.routes());
router.use('/verification', verification.routes());
router.use('/upload', upload.routes());
router.use('/tags', tag.routes());
router.use('/archives', archive.routes());
router.use('/summary', summary.routes());

module.exports = router;
