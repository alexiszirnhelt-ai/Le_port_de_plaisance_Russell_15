const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.get('/login', (req, res) => {
  return res.redirect('/');
});

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

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).send('JWT_SECRET manquant dans .env');
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    return res.redirect('/dashboard');
  } catch (error) {
    return res.status(500).send('Erreur serveur lors de la connexion.');
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
});

module.exports = router;
