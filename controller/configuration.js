const configurationModel = require('../model/configuration');

const FREEZE_CONFIGUARTIONS = ['EMAIL', 'QINIU_OSS', 'SITE_INFO', 'TAG', 'ARCHIVE', 'CATEGORY'];
const PRIVATE_CONFIGUARTIONS = ['EMAIL', 'QINIU_OSS'];

/**
 * 创建
 * @param ctx 
 * @param next 
 */
async function create (ctx, next) {
    const signinedUser = ctx.request.signinedUser;
    const isAdmin = signinedUser.permissions.includes('admin');
    const configuration = {
        name: ctx.request.body.name,
        key: ctx.request.body.key,
        private: ctx.request.private,
        freeze: ctx.request.freeze,
        deleted: ctx.request.deleted,
        options: ctx.request.body.options,
        enabled: ctx.request.body.enabled,
        creator: signinedUser._id,
        editor:  signinedUser._id
    };

    if (!isAdmin && FREEZE_CONFIGUARTIONS.includes(configuration.key)) {
        ctx.throw(403, {
            type: 'permission_error',
            message: `protected key: ${configuration.key}, only admin can create`
        });
    }

    if (FREEZE_CONFIGUARTIONS.includes(configuration.key)) {
        configuration.freeze = true;
    }

    if (PRIVATE_CONFIGUARTIONS.includes(configuration.key)) {
        configuration.private = true;
    }

    // 七牛配置信息
    if (configuration.key === 'QINIU_OSS') {
        const { options } = configuration;
        const neededFields = ['accessKey', 'secretKey', 'scope', 'domain'];

        neededFields.forEach((field) => {
            if (!options[field]) {
                ctx.throw(401, {
                    type: 'verification_error',
                    message: `${filed} can not be null`
                });
            }
        });
    }

    // 邮箱 smtp 服务配置信息
    if (configuration.key === 'EMAIL') {
        const { options } = configuration;
        const neededFields = ['authUser', 'authPass', 'host', 'port'];

        neededFields.forEach((field) => {
            const value = options[field];

            if (!value) {
                ctx.throw(401, {
                    type: 'verification_error',
                    message: `${field} can not be null`
                });
            }

            if (field === 'authUser' && !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)) {
                ctx.throw(401, {
                    type: 'verification_error',
                    message: `invalid authUser, must be a valid email address`
                });
            }
        });
    }

    ctx.body = await configurationModel.create(configuration);
}

/**
 * 修改
 * @param ctx 
 * @param next 
 */
async function edit (ctx, next) {
    const signinedUser = ctx.request.signinedUser;
    const isAdmin = signinedUser.permissions.includes('admin');
    const configurationId = ctx.params.id;
    const configuration = ctx.request.body;

    const updatedData = {};
    const modifiedFields = ['name', 'key', 'options', 'private', 'freeze', 'deleted', 'enabled'];

    const currentConfiguration = await configurationModel.findById(configurationId);

    // 不存在或者该规则不属于当前登录用户
    if (!currentConfiguration || (currentConfiguration.private && signinedUser._id != currentConfiguration.creator)) {
        ctx.throw(404, {
            type: 'resource_error',
            message: `no such record id: ${configurationId}`
        });
    }

    // 被冻结的配置项只有管理员才能修改
    if (currentConfiguration.freeze && !isAdmin) {
        ctx.throw(403, {
            type: 'permission_error',
            message: `only admin can edit ${configuration.key} configuration`
        });
    }

    Object.keys(configuration).forEach(key => {
        if (modifiedFields.indexOf(key) === -1) return;
        updatedData[key] = configuration[key];
    });

    updatedData.updateTime = Date.now();
    updatedData.editor = signinedUser._id;

    await configurationModel.findByIdAndUpdate(configurationId, updatedData);

    ctx.body = { success: true };
}

/**
 * 获取
 * @param ctx 
 * @param next 
 */
async function get (ctx, next) {
    const signinedUser = ctx.request.signinedUser || {};
    const configurationId = ctx.params.id;
    const queryData = ctx.query;
    const selectedOptions = { __v: 0 };

    // 非登录用户只能拿大公开的非敏感类信息
    if (!signinedUser._id) {
        queryData.private = false;
        queryData.deleted = false;

        selectedOptions.private = 0;
        selectedOptions.freeze = 0;
        selectedOptions.enabled = 0;
        selectedOptions.deleted = 0;
        selectedOptions.editor = 0;
        selectedOptions.creator = 0;
        selectedOptions.updateTime = 0;
        selectedOptions.createTime = 0;
    }

    if (configurationId) {
        const configuration = await configurationModel
            .findOne({ _id: configurationId, ...queryData }, selectedOptions)
            .populate('creator', '_id nickname avator')
            .populate('editor', '_id nickname avator');

        // 不存在的配置或者配置项是私密的且刚好当前用户不是 creator
        if (!configuration || (configuration.private && signinedUser._id != (configuration.creator && configuration.creator._id))) {
            ctx.throw(404, {
                type: 'resource_error',
                message: `no such record id: ${configurationId}`
            });
        }

        ctx.body = configuration;
        return;
    }

    const data = await configurationModel
        .find(queryData, selectedOptions)
        .populate('creator', '_id nickname avator')
        .populate('editor', '_id nickname avator');

    ctx.body = data.filter(v => !(v.private && v.creator._id != signinedUser._id));
}

/**
 * 删除
 * @param ctx 
 * @param next 
 */
async function del (ctx, next) {
    const configurationId = ctx.params.id;
    const configuration = configurationModel.findById(configurationId);

    if (!configuration || configuration.private && configuration.creator != signinedUser._id) {
        ctx.throw(404, {
            type: 'resource_error',
            message: `no such record id: ${configurationId}`
        });
    }

    // 这种情况只能(找管理员)先对该规则解冻 然后再删除
    if (configuration.freeze) {
        ctx.throw(403, 'freezed configuration can not be deleted');
    }

    await configurationModel.findByIdAndDelete(configurationId);

    ctx.body = {
        success: true
    };
}


module.exports = {
    create,
    del,
    edit,
    get
};
