import Mongoose from 'mongoose';

const blackListSchema = new Mongoose.Schema({
    ip: String
});

export default Mongoose.model('black-list', blackListSchema);