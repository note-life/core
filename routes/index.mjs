import JWT from 'jsonwebtoken';
import Router from 'koa-router';

import summary from './summary';
import note from './note';
import user from './user';
import configuration from './configuration';
import setup from './setup';
import verification from './verification';
import upload from './upload';
import tag from './tag';
import archive from './archive';

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

export default router;