const JWT = require('jsonwebtoken');
const userModel = require('../model/user');
const { psd, randomAvator } = require('../utils');

/**
 * 数据库配置
 * @param ctx 
 * @param next 
 */
async function db (ctx, next) {
    ctx.body =  '404'; //'暂时不走线上配置，直接写在 config 中';
}

/**
 * admin 账号
 * @param ctx 
 * @param next 
 */
async function admin (ctx, next) {
    const req = ctx.request.body;
    const { salt, hash } = psd.encrypt(req.password);

    const user = {
        email: req.email,
        password: hash,
        salt,
        avator: randomAvator(req.email),
        joinedDate: Date.now(),
        nickname: req.nickname,
        permissions: ['admin', 'invite', 'remove'],
        status: 'actived'
    };

    const rs = await userModel.findOne({ permissions: { '$in': ['admin'] } });

    if (rs) {
        ctx.throw(401, {
            type: 'verification_error',
            message: 'admin account already exists!'
        });
    } else {
        const rs = await userModel.create(user);

        const token = JWT.sign({
            _id: user._id,
            permissions: user.permissions,
            status: user.status,
        }, ctx._TOKEN_SECRET, { expiresIn: '2h' });

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
                status: rs.status
            }
        };
    }
}

module.exports = {
    db,
    admin
};
