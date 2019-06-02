import Router from 'koa-router';
import { tag } from '../controller';

const router = new Router();

router.use(async (ctx, next) => {
    const signinedUser = ctx.request.signinedUser;

    // 只有 admin 权限才能操作
    if (signinedUser && !signinedUser.permissions.includes('admin') && ctx.method !== 'GET') {
        ctx.throw(403, {
            type: 'permission_error',
            message: 'only admin can add tag'
        });
    }

    await next();
});

router.get('/', tag.get);
router.post('/', tag.add);
router.del('/:id', tag.del);

export default router;