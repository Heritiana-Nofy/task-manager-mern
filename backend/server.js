const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Charger les variables d'env
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Route de base
app.get('/', (req, res) => {
  res.send('API Task Manager en cours d\'exécution...');
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur interne'
  });
});

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB (Simulée pour le développement local si pas de DB)
const connectDB = async () => {
  try {
    // Note: Dans un environnement réel, MONGO_URI doit être valide
    // Pour ce projet, on suppose que l'utilisateur installera MongoDB localement
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connecté...');
  } catch (err) {
    console.error('Erreur de connexion MongoDB:', err.message);
    // Ne pas arrêter le processus pour permettre le test du code
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
});
