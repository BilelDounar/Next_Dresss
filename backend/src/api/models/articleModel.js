const mongoose = require('mongoose');
const { Schema } = mongoose;

const articleSchema = new Schema({
    publicationId: {
        type: Schema.Types.ObjectId,
        ref: 'Publication',
        required: true
    },
    urlPhoto: {
        type: String,
        required: true
    },
    titre: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    lien: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Article', articleSchema);