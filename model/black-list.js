const Mongoose = require('mongoose');

const blackListSchema = new Mongoose.Schema({
    ip: String
});

module.exports = Mongoose.model('black-list', blackListSchema);
