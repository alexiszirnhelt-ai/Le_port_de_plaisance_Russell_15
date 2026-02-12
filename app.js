require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/port_russell';

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Port Russell active');
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connexion a MongoDB reussie');
    app.listen(PORT, () => {
      console.log(`Serveur demarre sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erreur de connexion a MongoDB :', error.message);
    process.exit(1);
  });
