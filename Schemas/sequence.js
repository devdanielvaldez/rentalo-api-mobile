const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Sequence = new Schema(
  {
    sequenceId: {
      type: Number,
      index: {
        unique: true,
      },
    },
    isSequence: {
      type: Boolean,
      index: {
        unique: true,
      },
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Sequence', Sequence);
