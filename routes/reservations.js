const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

const router = express.Router();

const hasOverlappingReservation = async ({ catwayNumber, checkIn, checkOut, excludeId }) => {
  const overlapQuery = {
    catwayNumber,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeId) {
    overlapQuery._id = { $ne: excludeId };
  }

  const existingReservation = await Reservation.findOne(overlapQuery);
  return Boolean(existingReservation);
};

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ checkIn: 1 });
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
    const { catwayNumber, checkIn, checkOut } = req.body;
    const hasOverlap = await hasOverlappingReservation({
      catwayNumber,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
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

router.put('/:id', async (req, res) => {
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
    const nextCheckIn = req.body.checkIn ? new Date(req.body.checkIn) : currentReservation.checkIn;
    const nextCheckOut = req.body.checkOut ? new Date(req.body.checkOut) : currentReservation.checkOut;

    const hasOverlap = await hasOverlappingReservation({
      catwayNumber: nextCatwayNumber,
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
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

router.delete('/:id', async (req, res) => {
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
