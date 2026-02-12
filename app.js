require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/port_russell';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis.');
  }

  return res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.send('Tableau de bord');
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
