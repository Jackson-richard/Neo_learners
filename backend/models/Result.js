const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    scores: {
      reading: {
        type: Number,
        default: 0,
      },
      writing: {
        type: Number,
        default: 0,
      },
      comprehension: {
        type: Number,
        default: 0,
      },
      overall: {
        type: Number,
        default: 0,
      },
    },
    responses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response',
      },
    ],
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Result', ResultSchema);
