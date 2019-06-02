import archiveModel from '../model/archive';

async function add (ctx) {
    const { archive } = ctx.request.body;

    if (!archive) {
        ctx.throw(401, {
            type: '',
            message: 'archive name can not be null'
        });
    }

    if (typeof archive !== 'string') {
        ctx.throw(401, {
            type: '',
            message: 'archive name must be a string'
        });
    }

    ctx.body = await archiveModel.create({ name: archive.trim() });
}

async function del (ctx) {
    const archiveId = ctx.params.id;

    await archiveModel.findByIdAndDelete(archiveId);

    ctx.body = { success: true }
}

async function get (ctx) {
    ctx.body = await archiveModel.find();
}

export default {
    get, 
    add,
    del
}