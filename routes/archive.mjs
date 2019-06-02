import Router from 'koa-router';
import { archive } from '../controller';

const router = new Router();

router.use(async (ctx, next) => {
    const signinedUser = ctx.request.signinedUser;

    // 只有 admin 权限才能操作
    if (signinedUser && !signinedUser.permissions.includes('admin') && ctx.method !== 'GET') {
        ctx.throw(403, {
            type: 'permission_error',
            message: 'only admin can add archive'
        });
    }

    await next();
});

router.get('/', archive.get);
router.post('/', archive.add);
router.del('/:id', archive.del);

export default router;