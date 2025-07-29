const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Veuillez entrer un nom d\`utilisateur'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Veuillez entrer un email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer un email valide']
    },
    password: {
        type: String,
        required: [true, 'Veuillez entrer un mot de passe'],
        minlength: 6,
        select: false // Ne pas renvoyer le mot de passe par défaut
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending'
    },
    // Ajoutez d'autres champs si nécessaire (ex: nom, prénom, etc.)
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Crypter le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour comparer le mot de passe entré avec celui en base de données
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
