const mongoose = require('mongoose');

const SUPPORTED_LANGUAGES = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam'];

const ExerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['matching', 'multiple_choice', 'listen_repeat', 'fill_blank', 'translation', 'word_match', 'sentence_builder', 'listening', 'speaking', 'image_recognition', 'learn_word'],
    default: 'multiple_choice'
  },
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
  audioUrl: String,
  imageUrl: String
});

const VocabularySchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: String,
  pronunciation: String,
  audioUrl: String,
  imageUrl: String
});

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify difficulty level'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Please specify estimated duration in minutes'],
    },
    category: {
      type: String,
      required: [true, 'Please specify lesson category'],
      trim: true,
    },
    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: 'English',
    },
    unit: {
      type: Number,
      required: true,
      default: 1,
    },
    activityNumber: {
      type: Number,
      required: true,
      default: 1, // 1 to 20
    },
    order: {
      type: Number,
      default: 0,
    },
    xpReward: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    learningMaterials: String,
    vocabulary: [VocabularySchema],
    exercises: [ExerciseSchema],
    translations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonTranslation',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', LessonSchema);
