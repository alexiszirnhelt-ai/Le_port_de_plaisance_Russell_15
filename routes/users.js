const express = require('express');
const User = require('../models/User');

const router = express.Router();

const normalizeEmailParam = (value) => {
  const decoded = decodeURIComponent(value || '');
  const normalized = decoded.toLowerCase().trim();
  if (!normalized || !normalized.includes('@')) {
    return null;
  }
  return normalized;
};

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ email: 1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:email', async (req, res) => {
  const email = normalizeEmailParam(req.params.email);
  if (!email) {
    return res.status(400).json({ message: 'Email invalide.' });
  }

  try {
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Nom d utilisateur, email et mot de passe requis.' });
  }

  try {
    const created = await User.create({ username, email, password });
    return res.status(201).json({
      _id: created._id,
      username: created.username,
      email: created.email,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.put('/:email', async (req, res) => {
  const emailParam = normalizeEmailParam(req.params.email);
  if (!emailParam) {
    return res.status(400).json({ message: 'Email invalide.' });
  }

  const { username, email, password } = req.body;

  try {
    const user = await User.findOne({ email: emailParam });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }

    await user.save();
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.delete('/:email', async (req, res) => {
  const email = normalizeEmailParam(req.params.email);
  if (!email) {
    return res.status(400).json({ message: 'Email invalide.' });
  }

  try {
    const deleted = await User.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.status(200).json({ message: 'Utilisateur supprime.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
