const mongoose = require('mongoose');
const { Schema } = mongoose;

const publicationSchema = new Schema({
    description: {
        type: String,
        required: [true, 'La description de la publication est requise.'],
        trim: true
    },
    user: {
        type: String,
        required: true
    },
    urlsPhotos: [{
        type: String,
        required: true
    }],
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }],
    tags: [String],
    likes: {
        type: Number,
        default: 0
    },
    dateCreation: {
        type: Date,
        default: Date.now
    },
    dateEdition: {
        type: Date,
        default: Date.now
    }
});

// Mettre à jour dateEdition avant chaque sauvegarde
publicationSchema.pre('save', function (next) {
    this.dateEdition = Date.now();
    next();
});

module.exports = mongoose.model('Publication', publicationSchema);
