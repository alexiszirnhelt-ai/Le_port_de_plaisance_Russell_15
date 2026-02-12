const express = require('express');
const mongoose = require('mongoose');
const Catway = require('../models/Catway');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(200).json(catways);
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
    const catway = await Catway.findById(id);

    if (!catway) {
      return res.status(404).json({ message: 'Catway introuvable.' });
    }

    return res.status(200).json(catway);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const catway = await Catway.create(req.body);
    return res.status(201).json(catway);
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const catway = await Catway.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!catway) {
      return res.status(404).json({ message: 'Catway introuvable.' });
    }

    return res.status(200).json(catway);
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const catway = await Catway.findByIdAndDelete(id);

    if (!catway) {
      return res.status(404).json({ message: 'Catway introuvable.' });
    }

    return res.status(200).json({ message: 'Catway supprime.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
