const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ email: 1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const created = await User.create({ email, password });
    return res.status(201).json({
      _id: created._id,
      email: created.email,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
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
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    return res.status(200).json({ message: 'Utilisateur supprime.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
