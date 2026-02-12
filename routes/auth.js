const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email et mot de passe requis.');
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).send('Identifiants invalides.');
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).send('Identifiants invalides.');
    }

    return res.redirect('/dashboard');
  } catch (error) {
    return res.status(500).send('Erreur serveur lors de la connexion.');
  }
});

router.post('/logout', (req, res) => {
  return res.redirect('/');
});

module.exports = router;
