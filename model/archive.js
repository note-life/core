const Mongoose = require('mongoose');

const archiveSchema = new Mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});

module.exports = Mongoose.model('archive', archiveSchema);
