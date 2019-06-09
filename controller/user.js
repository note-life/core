const JWT = require('jsonwebtoken');
const userModel = require('../model/user');
const configurationModel = require('../model/configuration');
const { mailTo, psd, randomAvator } = require('../utils');

const STATUS = ['inactivated', 'removed', 'actived'];
const PERMISSIONS = ['remove', 'invite'];

/**
 * 创建
 * @param ctx 
 * @param next 
 */
async function create (ctx, next) {
    const signinedUser = ctx.request.signinedUser;
    const user = ctx.request.body;
    const defaultPassword = Math.random().toString(36).slice(2);
    const { hash, salt } = psd.encrypt(defaultPassword);

    if (!signinedUser.permissions.includes('invite')) {
        ctx.throw(403, {
            type: 'permission_error',
            message: `you don't have 'invite' permission`
        });
    }

    user.password = hash;
    user.salt = salt;
    user.joinedDate = Date.now();
    user.nickname = user.nickname || (new Date).getTime();
    user.permissions = [];
    user.status = 'inactivated';
    user.avator = randomAvator(user.email);

    const mailConfig = await configurationModel.findOne({ key: 'EMAIL' });

    await userModel.create(user);

    if (mailConfig && mailConfig.enabled) {
        const mailOption = mailConfig.options;
        const msgOptions = {
            from: `Note.Life 👻 <${mailOption.authUser}>`,
            to: user.email,
            subject: 'account active',
            text: 'Activate account',
            html: `<p>Initial password: ${defaultPassword}</p>`
        };

        mailTo(mailOption, msgOptions);
    }
    
    ctx.body = { success: true };
}

/**
 * 获取
 * @param ctx 
 * @param next 
 */
async function get (ctx, next) {
    const userId = ctx.params.id;

    if (userId) {
        const user = await userModel.findById(userId, { password: 0, salt: 0, __v: 0 });

        if (!user) {
            ctx.throw(404, {
                type: 'resource_error',
                message: `no such record id: ${userId}`
            });
        }

        ctx.body = user;
        return;
    }

    ctx.body = await userModel.find({}, { password: 0, salt: 0, __v: 0 });
}

/**
 * 编辑更新
 * @param ctx 
 * @param next 
 */
async function edit (ctx, next) {
    const userId = ctx.params.id;
    const user = ctx.request.body;
    const signinedUser = ctx.request.signinedUser;

    if (!signinedUser) {
        ctx.throw(403);
    }

    const modifiedFields = ['coverImg', 'nickname', 'avator', 'email', 'password', 'intro', 'sites', 'permissions', 'status'];
    let updatedData = {};

    if (user.status && !STATUS.find(v => user.status === v)) {
        ctx.throw(401, {
            type: 'verification_error',
            message: 'invalid status value'
        });
    }

    Object.keys(user).forEach(key => {
        if (modifiedFields.indexOf(key) === -1) return;
        if (!signinedUser.permissions.includes('admin') && key === 'status') {
            ctx.throw(403, {
                type: 'permission_error',
                message: `you don't have permission to change this user's status`
            });
        }

        if (key === 'permissions') {
            updatedData.permissions = user.permissions.filter(v => PERMISSIONS.includes(v));

            // 避免 admin 给自己降级
            if (signinedUser._id == userId) {
                updatedData.permissions.push('admin');
            }
        } else {
            updatedData[key] = user[key];
        }
    });

    // 只有管理权限的账户才能对 permissions 进行修改
    if (user.permissions && !signinedUser.permissions.includes('admin')) {
        ctx.throw(403, {
            type: 'permission_error',
            message: `you don't have permission to edit this user's permission`
        });
    }

    // 不能随便移除
    if (!signinedUser.permissions.includes('remove') && updatedData.status === 'removed') {
        ctx.throw(403, {
            type: 'permission_error',
            message: `you don't have permission to remove this user`
        });
    }


    if (user.password) {
        const rs = await userModel.findById(userId);

        if (!psd.equal(user.oldPassword, rs && rs.salt, rs && rs.password)) {
            ctx.throw(401, 'old password is not equal to this user');
        }

        // 修改密码时重新随机一个 salt\
        const { hash, salt } = psd.encrypt(user.password);

        updatedData.password = hash;
        updatedData.salt = salt;
    }
    

    await userModel.findOneAndUpdate({ _id: userId }, updatedData);

    ctx.body = await userModel.findById(userId, { __v: 0, salt: 0, password: 0 });
}

/**
 * 删除
 * @param ctx 
 * @param next 
 */
async function del (ctx, next) {
    const userId = ctx.params.id;
    const signinedUser = ctx.request.signinedUser;

    // 只有 admin 权限才能物理删除
    if (!signinedUser.permissions.includes('admin')) {
        ctx.throw(403);
    }

    if (userId) {
        await userModel.findByIdAndDelete(userId);
    } else {
        await userModel.deleteMany({ '_id': { '$in': ctx.request.body.ids } });
    }

    ctx.body = { success: true };
}

/**
 * 撤销验证
 * 
 *   注: JWT 本身没有主动过期的方法, 考虑到记录不会太多，就简单用一个数组存储被强制过期的 token
 */
async function revoke (ctx, next) {
    let timer = null;
    const revokedToken = ctx.get('ut');
    const index = ctx.revokedTokens.indexOf(revokedToken);

    JWT.verify(revokedToken, ctx._TOKEN_SECRET);

    if(index < 0) {
        ctx.revokedTokens.push(revokedToken);

        // 到达本身已过期的限制时移除 token
        timer = setTimeout(() => {
            ctx.revokedTokens.splice(index, 1);
            clearTimeout(timer);
            timer = null;
        }, 1000 * 60 * 60 * 2);  // 两小时移除记录
    }

    ctx.body = { success: true };
}

/**
 * 身份验证
 */
async function authenticate (ctx, next) {
    const { email, nickname, password } = ctx.request.body;
    const query = email ? { email } : { nickname };
    const rs = await userModel.findOne(query);

    /**
     * 验证失败记录
     */
    let bedNum;

    const { _ICU_ACCOUNTS } = ctx;
    const patient = Object.values(query)[0];
    const inICU = _ICU_ACCOUNTS.find((v, i)=> {
        if (Object.keys(v)[0] === patient) {
            bedNum = i;
            return true
        }

        return false;
    });

    //  登录异常处理
    if (rs && inICU && _ICU_ACCOUNTS[bedNum][patient] > 2) {
        const mailConfig = await configurationModel.findOne({ key: 'EMAIL' });

        if (mailConfig && mailConfig.enabled) {
            const mailOption = mailConfig.options;
            const msgOptions = {
                from: `Note.Life 👻 <${mailOption.authUser}>`,
                to: rs.email,
                subject: 'Exception login warning',
                text: '安全提醒 ⚠️',
                html: `
                    <p>您的帐号多次验证失败。因此，我们向您发送这封电子邮件，以确保该操作是您本人所为，否则建议修改您密码。</p>
                `
            };

            mailTo(mailOption, msgOptions);
        }

        ctx.throw(401, {
            type: 'verification_error',
            message: '多次验证失败请明日再试'
        });

        return;
    }

    // 验证通过
    if (rs && psd.equal(password, rs && rs.salt, rs && rs.password)) {
        const updateData = {};
        const token = JWT.sign({
            _id: rs._id,
            permissions: rs.permissions,
            status: rs.status,
        }, ctx._TOKEN_SECRET, { expiresIn: '2h' });

        // 初次验证成功改变状态
        if (rs.status === 'inactivated') {
            updateData.status = 'actived';
        }

        const authTime = Date.now();

        await userModel.findOneAndUpdate({ _id: rs._id }, { ...updateData, authTime });
    
        ctx.body = {
            token,
            user: {
                nickname: rs.nickname,
                avator: rs.avator,
                joinedDate: rs.joinedDate,
                email: rs.email,
                _id: rs._id,
                permissions: rs.permissions,
                intro: rs.intro,
                status: rs.status,
                authTime
            }
        };
    } else {
        inICU ? _ICU_ACCOUNTS[bedNum][patient] += 1 : _ICU_ACCOUNTS.push({ [patient]: 1 });

        ctx.throw(401, {
            type: 'verification_error',
            message: 'please check your input'
        });
    }
}

/**
 * 忘记密码
 * @param ctx
 * @param next
 */
async function forget (ctx, next) {
    const { email, password, verificationCode } = ctx.request.body;
    const codeObj = ctx.verificationCodes.find(v => Object.keys(v)[0] === email) || {};

    if (Object.values(codeObj)[0] !== verificationCode) {
        ctx.throw(401, {
            type: 'verification_error',
            message: 'invalid verification code'
        });
    }

    if (!password) {
        ctx.throw(401, {
            type: 'verification_error',
            message: 'password can not be null'
        });
    }

    const { hash, salt } = psd.encrypt(password);

    await userModel.findOneAndUpdate({ email }, { password: hash, salt });

    
    let index;

    ctx.verificationCodes.find((v, i) => {
        if (Object.keys(v)[0] !== email) {
            index = i;
            return true;
        }

        return false;
    });
    ctx.verificationCodes.splice(index, 1);
    ctx.body = { success: true };
}

module.exports = {
    create,
    get,
    edit,
    del,
    revoke,
    authenticate,
    forget
};
