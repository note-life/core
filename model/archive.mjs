import Mongoose from 'mongoose';

const archiveSchema = new Mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});

export default Mongoose.model('archive', archiveSchema);