const Mongoose = require('mongoose');

const { Schema } = Mongoose;

/**
 * name        配置项名称
 * key         配置项标识 key
 * options     配置项具体内容
 * createTime  配置项创建的时间
 * updateTime  配置项更新的时间
 * creator     谁创建的
 * editor      编辑人
 * private     是否私有
 * freeze      是否冻结 （冻结的配置项无法删除）只有先解冻、且冻结的配置只有管理员才有权限操作
 * deleted     是否删除
 * enabled     是否启用
 */
const configurationSchema = new Mongoose.Schema({
    name: {
        type: String,
        unique: true,
        validate: {
            validator: value => value.length < 181,
            message: 'please control within 180 characters'
        }
    },
    key: {
        type: String,
        unique: true,
        validate: {
            validator: value => value.length < 181,
            message: 'please control within 180 characters'
        }
    },
    options: {
        type: Object,
        default: {},
        validate: {
            validator: value => JSON.stringify(value).length < 9801,
            message: 'please control within 9800 characters'
        }
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    creator: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    editor: {
        ref: 'user',
        type: Schema.Types.ObjectId
    },
    private: {
        type: Boolean,
        default: true
    },
    freeze: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    enabled: {
        type: Boolean,
        default: true
    }
});

configurationSchema.pre('update', function(next) {
    this.options.runValidators = true;
    next();
});


module.exports = Mongoose.model('configuration', configurationSchema);
