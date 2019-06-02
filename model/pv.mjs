import Mongoose from 'mongoose';

const pvSchema = new Mongoose.Schema({
    ip: String,
    referrer: String,
    userAgent: String,
    time: Date,
    noteId: String
});

export default Mongoose.model('pv', pvSchema);