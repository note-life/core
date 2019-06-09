const Mongoose = require('mongoose');

/**
 * coverImg       封面
 * nickname       昵称
 * avator         头像
 * email          邮箱
 * password       加密后的密码 (hash)
 * salt           加密的 salt
 * intro          概要介绍
 * permissions    操作权限 
 * status         状态
 * sites          其它站点
 * joinedDate     加入日期
 */

const passwordValidators = [
    {
      validator: value => {
        return value.length < 101;
      },
      message: 'please control within 100 characters'
    },
    {
      validator: value => {
        return !/ /.test(value);
      },
      message: 'Can\'t exist blank character'
    }
];

const userSchema = new Mongoose.Schema({
    coverImg: {
        type: String,
        default: ''
    },
    nickname: {
        type: String,
        validate: {
            validator: value => value.length < 41,
            message: 'please control within 40 characters'
        },
        unique: true
    },
    avator: {
        type: String,
        default: 'avator'
    },
    email: {
        type: String,
        validate: {
            validator: value => /[\w-\.]+@([\w-]+\.)+[a-z]{2,3}/.test(value),
            message: 'invalid email'
        },
        required: [true, 'email is required'],
        unique: true
    },
    password: {
        type: String,
        validate: passwordValidators,
        required: [true, 'password is required']
    },
    salt: String,
    intro: {
        type: String,
        default: 'there is nothing!'
    },
    permissions: {
        type: Array,
        default: []  // invite 邀请权限, remove 移除用户权限, admin 管理员权限可对其他用户进行权限提升
    },
    status: {
        type: String,
        default: 'inactivated'  // inactivated, removed, 
    },
    sites: [{
        name: String,
        icon: String,
        url: String
    }],
    joinedDate: {
        type: Date,
        default: Date.now
    },
    authTime: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('update', function(next) {
    this.options.runValidators = true;
    next();
});

module.exports = Mongoose.model('user', userSchema);
