import Router from 'koa-router';
import userModel from '../model/user';
import noteModel from '../model/note';
import tagModel from '../model/tag';
import pvModel from '../model/pv';

const router = new Router();

router.get('/', async (ctx, next) => {
    const signinedUser = ctx.request.signinedUser;

    if (!signinedUser) {
        ctx.throw(404);
    }

    const p1 = userModel.find({}, { status: 1 });
    const p2 = noteModel.find({ deleted: false }, { draft: 1, private: 1, deleted: 1 });
    const p3 = pvModel.find({}, { __v: 0 });
    const p4 = tagModel.find({}, { __v: 0 });

    const data = await Promise.all([p1, p2, p3, p4]);

    ctx.body = {
        users: {
            total: data[0].length,
            actived: data[0].filter(v => v.status === 'actived').length,
            inactivated: data[0].filter(v => v.status === 'inactivated').length,
            removed: data[0].filter(v => v.status === 'removed').length
        },
        notes: {
            total: data[1].length,
            public: data[1].filter(v => !v.draft && !v.private).length,
            draft: data[1].filter(v => v.draft && !v.private).length,
            private: data[1].filter(v => v.private).length,
        },
        pv: data[2],
        tags: { total: data[3].length }
    };
});

export default router;