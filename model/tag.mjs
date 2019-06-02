import Mongoose from 'mongoose';

const tagSchema = new Mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});

export default Mongoose.model('tags', tagSchema);