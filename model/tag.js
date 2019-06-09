const Mongoose = require('mongoose');

const tagSchema = new Mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});

module.exports = Mongoose.model('tags', tagSchema);
