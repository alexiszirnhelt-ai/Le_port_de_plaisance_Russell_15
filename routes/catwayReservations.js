const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

const router = express.Router();

const parseCatwayNumberParam = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

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

const isValidReservationId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildReservationPayload = (body) => {
  const payload = {};
  if (body.clientName !== undefined) payload.clientName = body.clientName;
  if (body.boatName !== undefined) payload.boatName = body.boatName;
  if (body.startDate !== undefined) payload.startDate = body.startDate;
  if (body.endDate !== undefined) payload.endDate = body.endDate;
  return payload;
};

router.get('/:id/reservations', async (req, res) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'ID catway invalide.' });
  }

  try {
    const reservations = await Reservation.find({ catwayNumber }).sort({ startDate: 1 });
    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id/reservations/:idReservation', async (req, res) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  const { idReservation } = req.params;

  if (catwayNumber === null || !isValidReservationId(idReservation)) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  try {
    const reservation = await Reservation.findOne({ _id: idReservation, catwayNumber });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }
    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/:id/reservations', auth, async (req, res) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  if (catwayNumber === null) {
    return res.status(400).json({ message: 'ID catway invalide.' });
  }

  try {
    const { startDate, endDate } = req.body;
    const hasOverlap = await hasOverlappingReservation({
      catwayNumber,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    if (hasOverlap) {
      return res.status(409).json({ message: 'Ce catway est deja reserve sur cette periode.' });
    }

    const payload = {
      ...buildReservationPayload(req.body),
      catwayNumber,
    };

    const reservation = await Reservation.create(payload);
    return res.status(201).json(reservation);
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
});

const updateNestedReservation = async (req, res, idReservationFromBody = false) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  const idReservation = idReservationFromBody ? req.body.idReservation : req.params.idReservation;

  if (catwayNumber === null || !isValidReservationId(idReservation)) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  try {
    const currentReservation = await Reservation.findOne({ _id: idReservation, catwayNumber });
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }

    const payload = buildReservationPayload(req.body);
    const nextStartDate = payload.startDate ? new Date(payload.startDate) : currentReservation.startDate;
    const nextEndDate = payload.endDate ? new Date(payload.endDate) : currentReservation.endDate;

    const hasOverlap = await hasOverlappingReservation({
      catwayNumber,
      startDate: nextStartDate,
      endDate: nextEndDate,
      excludeId: idReservation,
    });

    if (hasOverlap) {
      return res.status(409).json({ message: 'Ce catway est deja reserve sur cette periode.' });
    }

    const reservation = await Reservation.findOneAndUpdate(
      { _id: idReservation, catwayNumber },
      payload,
      { new: true, runValidators: true }
    );

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(400).json({ message: 'Donnees invalides.', error: error.message });
  }
};

router.put('/:id/reservations/:idReservation', auth, async (req, res) =>
  updateNestedReservation(req, res, false)
);

router.put('/:id/reservations', auth, async (req, res) => updateNestedReservation(req, res, true));

router.delete('/:id/reservations/:idReservation', auth, async (req, res) => {
  const catwayNumber = parseCatwayNumberParam(req.params.id);
  const { idReservation } = req.params;

  if (catwayNumber === null || !isValidReservationId(idReservation)) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  try {
    const reservation = await Reservation.findOneAndDelete({ _id: idReservation, catwayNumber });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation introuvable.' });
    }
    return res.status(200).json({ message: 'Reservation supprimee.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
