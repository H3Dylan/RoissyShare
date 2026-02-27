const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const structureRoutes = require('./src/routes/structure.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier uploads (pour les logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/structures', structureRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
