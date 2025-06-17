require('dotenv').config(); // Charge les variables d'environnement
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connexion à la base de données
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
