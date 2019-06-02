import Mongoose from 'mongoose';

const { Schema } = Mongoose;

/**
 * - author        作者
 * - title         标题
 * - content       内容
 * - archive       归档
 * - tags          标签
 * - summary       摘要
 * - coverImg      封面图
 * - publishTime   发布实践
 * - updateTime    更新时间
 * - draft         是否为草稿
 * - deleted       是否被删除
 * - private       是否私密
 */
const noteSchema = new Mongoose.Schema({
    author: {
        ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
            validator: value => !!value,
            message: 'author is required'
        },
        required: [true, 'author is required']
    },
    title: {
        type: String,
        validate: {
            validator: value => !!value,
            message: 'title is required'
        },
        required: [true, 'title is required']
    },
    content: {
        type: String,
        validate: {
            validator: value => !!value,
            message: 'content is required'
        },
        required: [true, 'content is required']
    },
    archive: {
        type: String,
        validate: {
            validator: value => !!value,
            message: 'archive is required'
        },
        required: [true, 'archive is required']
    },
    tags: Array,
    summary: String,
    coverImg: String,
    publishTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    draft: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    private: {
        type: Boolean,
        default: false
    }
});

/**
 * do fancy stuff
 * @param queryData {Object} 查询条件
 * @param selectedOptions {Object} 控制返回的字段
 * @param getCount {Boolean} 是否获取所有记录的计数
 */
function fancy (queryData, selectedOptions, getCount) {
    const queryOptions = {};
    const {
        limit = 10,  // {Number}
        offset = 0,  // {Number}
        keywords = '',  // {String}
        author,  // {String}
        title,  // {String}
        archive,  // {String}
        tags,  // {String}
        draft,  // {Boolean}
        // private,  // {Boolean}  // private 保留词
        deleted  // {Boolean}
    } = queryData;

    if (author) queryOptions.author = author;
    if (title) queryOptions.title = title;
    if (archive) queryOptions.archive = archive;
    if (tags) queryOptions.tags = { '$in': tags.split(',') };
    if (keywords) queryOptions.content = { '$regex': keywords, '$options': 'i' };

    if (draft !== undefined) queryOptions.draft = draft;
    if (queryData.private !== undefined) queryOptions.private = queryData.private;
    if (deleted !== undefined) queryOptions.deleted = deleted;

    if (getCount) {
        return this.find(queryOptions).countDocuments();
    }

    // console.log(queryOptions)

    return this.find(
        queryOptions,
        Object.assign({ '__v': 0 }, selectedOptions),
        { limit: +limit, sort: {'_id': -1}, skip: +offset }
    ).populate('author', '_id nickname avator email');
};

noteSchema.static('getCount', function (queryData) {
    return fancy.call(this, queryData, undefined, true);
});

noteSchema.static('findNotes', function (queryData, selectedOptions) {
    return fancy.call(this, queryData, selectedOptions);
});

noteSchema.static('findPrevById', function (id) {
    return this.findOne(
        { '_id': {'$lt': id}, 'draft': false, private: false, deleted: false },
        { 'title': 1, '_id': 1 },
        { sort: {'_id': 1} },
    );
});

noteSchema.static('findNextById', function (id) {
    return this.findOne(
        { '_id': {'$gt': id}, 'draft': false, private: false, deleted: false },
        { 'title': 1, '_id': 1 },
        { sort: {'_id': -1} },
    );
});

noteSchema.static('findNext', function (time) {
    return this.findOne(
        { 'publishTime': {'$lt': time}, 'draft': false, private: false, deleted: false },
        { 'title': 1, '_id': 1 },
        { sort: {'publishTime': -1} },
    );
});

noteSchema.static('findPrev', function (time) {
    return this.findOne(
        { 'publishTime': {'$gt': time}, 'draft': false, private: false, deleted: false },
        { 'title': 1, '_id': 1 },
        { sort: {'publishTime': 1} },
    );
});

noteSchema.pre('update', function(next) {
    this.options.runValidators = true;
    next();
});

export default Mongoose.model('note', noteSchema);