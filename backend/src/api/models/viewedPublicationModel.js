const mongoose = require('mongoose');

const viewedPublicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    publication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication',
        required: true
    }
}, {
    timestamps: { createdAt: 'viewedAt' }
});

// To prevent a user from having multiple 'viewed' entries for the same publication
viewedPublicationSchema.index({ user: 1, publication: 1 }, { unique: true });

module.exports = mongoose.model('ViewedPublication', viewedPublicationSchema);
