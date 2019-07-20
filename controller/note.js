const noteModel = require('../model/note');
const pvModel = require('../model/pv');

/**
 * 创建
 * @param ctx 
 * @param next 
 */
async function create (ctx, next) {
    const signinedUser = ctx.request.signinedUser;
    const note = ctx.request.body;
    const now = Date.now();

    note.publishTime = (new Date(note.publishTime)).getTime() || now;
    note.updateTime = (new Date(note.updateTime)).getTime() || now;
    note.author = signinedUser._id;
    note.deleted = false;
    
    ctx.body  =  await noteModel.create(note);
}

/**
 * 删除
 * @param ctx 
 * @param next 
 */
async function del (ctx, next) {
    const noteId = ctx.params.id;

    if (noteId) {
        await noteModel.findByIdAndDelete(noteId);
    } else {
        await noteModel.deleteMany({ '_id': { '$in': ctx.request.body.ids } });
    }

    ctx.body = {
        success: true
    };
}

/**
 * 修改
 * @param ctx 
 * @param next 
 */
async function edit (ctx, next) {
    const signinedUser = ctx.request.signinedUser;
    const noteId = ctx.params.id;
    const note = ctx.request.body;
    const updatedData = {};
    const modifiedFields = ['title', 'content', 'summary', 'coverImg', 'tags', 'archive', 'draft', 'private', 'deleted'];

    const noteStored = await noteModel.findById(noteId);

    // 只有管理员和 note author 可以编辑 note
    if (!(signinedUser.permissions.includes('admin') || signinedUser._id ==  noteStored.author)) {
        ctx.throw(403, {
            type: 'permission_error',
            message: `you don't have permission to edit this note`
        });
    }

    Object.keys(note).forEach(key => {
        if (modifiedFields.indexOf(key) === -1) return;
        updatedData[key] = note[key];
    });

    updatedData.updateTime = Date.now();

    await noteModel.update({ _id: noteId }, updatedData);

    ctx.body = await noteModel.findById(noteId).populate('author', '_id nickname avator email');
}

/**
 * 查询
 * @param ctx 
 * @param next 
 */
async function get (ctx, next) {
    const noteId = ctx.params.id;
    const signinedUser = ctx.request.signinedUser;

    if (noteId) {
        const note = await noteModel.findById(noteId).populate('author', '_id nickname avator email');
        const isNotPublic = note && (note.draft || note.deleted || note.private);  // only visible to logined user
        const isPrivate = note && note.private;  // only visible to author


        // 先判断对应查询结果是否为空，
        // 其次若有结果再判断当前访客是否登录且查询结果的公开性，
        // 最后若查询结果为私密 note 则判断当前登录用户是否与 note 所属作者相匹配
        if (!note || (!signinedUser && isNotPublic) || ((signinedUser && signinedUser._id) != note.author._id && isPrivate)) {
            ctx.throw(404, {
                type: 'resource_error',
                message: `no such record id: ${noteId}`
            });
        }

        const prevNote = await noteModel.findPrev(note.publishTime);
        const nextNote = await noteModel.findNext(note.publishTime);

        // store pv
        if (!signinedUser) {
            pvModel.create({
                ip: ctx.request.ip,
                referrer: ctx.get('referrer'),
                userAgent: ctx.get('user-agent'),
                time: Date.now(),
                noteId: noteId
            });
        }

        ctx.body = {
            prev: prevNote,
            note,
            next: nextNote
        };

        return;
    }

    const queryableFields = ['author', 'title', 'keywords', 'archive', 'tags', 'draft', 'deleted', 'private', 'offset', 'limit'];
    const queryData = {}; // { private: false };  // 默认 private = false
    let selectedOptions;

    Object.keys(ctx.query).forEach(key => {
        if (key === 'draft' || key === 'private' || key === 'deleted') {  // mongoose 处理: 'true' === true ?
            const value = ctx.query[key];

            if (value === '') return;

            ctx.query[key] = ctx.query[key] === 'true';
        }

        if (queryableFields.includes(key)) {
            queryData[key] = ctx.query[key];
        }
    });

    // 非后台用户（普通访客）只能获取公开 note && 隐藏一些关键信息的字段（private, draft, deleted）
    if (!signinedUser) {
        queryData.private = false;
        queryData.draft = false;
        queryData.deleted = false;
        selectedOptions = { private: 0, draft: 0, deleted: 0 };
    }

    // 私密的 note 记录只能 author 本人才能获取
    if (signinedUser && queryData.private) {
        queryData.author = signinedUser._id;
    }

    if (queryData.draft || queryData.public) {
        queryData.private = false;
    }

    ctx.body = {
        total: await noteModel.getCount(queryData),
        notes: await noteModel.findNotes(queryData, selectedOptions)
    };
}

module.exports = {
    create,
    del,
    edit,
    get
};
