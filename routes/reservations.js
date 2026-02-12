const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

const router = express.Router();

const hasOverlappingReservation = async ({ catwayNumber, startDate, endDate, excludeId }) => {
  const overlapQuery = {
    catwayNumber,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludeId) {
    overlapQuery._id = { $ne: excludeId };
  }

  const existingReservation = await Reservation.findOne(overlapQuery);
  return Boolean(existingReservation);
};

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ startDate: 1 });
    return res.status(200).json(reservations);
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
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { catwayNumber, startDate, endDate } = req.body;
    const hasOverlap = await hasOverlappingReservation({
      catwayNumber,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (hasOverlap) {
      return res.status(409).json({
        message: 'Ce catway est deja reserve sur cette periode.',
      });
    }

    const reservation = await Reservation.create(req.body);
    return res.status(201).json(reservation);
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
    const currentReservation = await Reservation.findById(id);

    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }

    const nextCatwayNumber = req.body.catwayNumber ?? currentReservation.catwayNumber;
    const nextStartDate = req.body.startDate ? new Date(req.body.startDate) : currentReservation.startDate;
    const nextEndDate = req.body.endDate ? new Date(req.body.endDate) : currentReservation.endDate;

    const hasOverlap = await hasOverlappingReservation({
      catwayNumber: nextCatwayNumber,
      startDate: nextStartDate,
      endDate: nextEndDate,
      excludeId: id,
    });

    if (hasOverlap) {
      return res.status(409).json({
        message: 'Ce catway est deja reserve sur cette periode.',
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(reservation);
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
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }

    return res.status(200).json({ message: 'Reservation supprimee.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
