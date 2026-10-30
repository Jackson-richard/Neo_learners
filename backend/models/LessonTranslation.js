const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add exercise question text'],
  },
  options: [
    {
      type: String,
    },
  ],
  correctAnswer: {
    type: String,
    required: [true, 'Please specify the correct answer'],
  },
});

const LessonTranslationSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu'],
    },
    title: {
      type: String,
      required: [true, 'Please add a translated title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a translated description'],
      trim: true,
    },
    learningMaterials: {
      type: String,
      required: [true, 'Please add learning materials content'],
    },
    exercises: [ExerciseSchema],
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

// Prevent multiple translations of the same lesson into the same language
LessonTranslationSchema.index({ lessonId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('LessonTranslation', LessonTranslationSchema);
