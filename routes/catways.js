const express = require('express');
const Catway = require('../models/Catway');
const auth = require('../middleware/auth');

const router = express.Router();

const parseCatwayNumberParam = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    return res.status(200).json(catways);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id', async (req, res) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const catway = await Catway.findOne({ catwayNumber });

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
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'catwayState')) {
      return res.status(400).json({ message: 'Le champ catwayState est requis.' });
    }

    const payload = {
      catwayState: req.body.catwayState,
    };

    const catway = await Catway.findOneAndUpdate({ catwayNumber }, payload, {
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
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'ID invalide.' });
  }

  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber });

    if (!catway) {
      return res.status(404).json({ message: 'Catway introuvable.' });
    }

    return res.status(200).json({ message: 'Catway supprime.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
