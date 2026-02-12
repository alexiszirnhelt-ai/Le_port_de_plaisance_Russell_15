const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Le numero de catway doit etre un entier.',
      },
    },
    catwayType: {
      type: String,
      required: true,
      enum: ['short', 'long'],
      trim: true,
      lowercase: true,
    },
    catwayState: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Catway', catwaySchema);
