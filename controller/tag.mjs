import tagModel from '../model/tag';

async function add (ctx) {
    const { tag } = ctx.request.body;

    if (!tag) {
        ctx.throw(401, {
            type: '',
            message: 'tag name can not be null'
        });
    }

    if (typeof tag !== 'string') {
        ctx.throw(401, {
            type: '',
            message: 'tag name must be a string'
        });
    }

    ctx.body = await tagModel.create({ name: tag.trim() });
}

async function del (ctx) {
    const tagId = ctx.params.id;

    await tagModel.findByIdAndDelete(tagId);

    ctx.body = { success: true }
}

async function get (ctx) {
    ctx.body = await tagModel.find();
}

export default {
    get, 
    add,
    del
}