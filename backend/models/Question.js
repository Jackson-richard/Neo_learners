const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify question type'],
      enum: ['Reading', 'Writing', 'Comprehension'],
    },
    text: {
      type: String,
      required: [true, 'Please add question text'],
      trim: true,
    },
    options: [
      {
        type: String,
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, 'Please specify the correct answer'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify question difficulty level'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    points: {
      type: Number,
      required: true,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
