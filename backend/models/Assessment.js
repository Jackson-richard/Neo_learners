const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an assessment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify assessment type'],
      enum: ['Reading', 'Writing', 'Comprehension'],
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify assessment difficulty level'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', AssessmentSchema);
