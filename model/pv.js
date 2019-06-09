const Mongoose = require('mongoose');

const pvSchema = new Mongoose.Schema({
    ip: String,
    referrer: String,
    userAgent: String,
    time: Date,
    noteId: String
});

module.exports = Mongoose.model('pv', pvSchema);
