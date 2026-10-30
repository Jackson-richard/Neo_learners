const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SUPPORTED_LANGUAGES = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LEARNING_GOALS = ['Literacy', 'School', 'Career', 'Travel', 'Personal Development'];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    age: {
      type: Number,
      required: [true, 'Please add age'],
    },
    education: {
      type: String,
      required: [true, 'Please add educational qualification'],
    },
    nativeLanguage: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: 'English',
    },
    learningLanguage: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: 'English',
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'learner'],
      default: 'learner',
    },
    reasonForLearning: {
      type: String,
      enum: LEARNING_GOALS,
      default: 'Literacy'
    },
    experienceLevel: {
      type: String,
      enum: [...PROFICIENCY_LEVELS, 'AI Placement'],
      default: 'Beginner'
    },
    proficiencyScore: {
      type: Number,
      default: 0
    },
    proficiencyLevel: {
      type: String,
      enum: PROFICIENCY_LEVELS,
      default: 'Beginner'
    },
    currentLevel: {
      type: String,
      enum: PROFICIENCY_LEVELS,
      default: 'Beginner',
    },
    placementPreference: {
      type: String,
      enum: ['manual', 'ai'],
      default: 'manual',
    },
    placementResults: {
      reading: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
      listening: { type: Number, default: 0 },
      speaking: { type: Number, default: 0 },
      vocabulary: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      comprehension: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
      assignedLevel: { type: String, enum: PROFICIENCY_LEVELS, default: 'Beginner' },
      completedAt: Date,
    },
    accessibility: {
      largeText: { type: Boolean, default: false },
      voiceGuidance: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      slowReadingMode: { type: Boolean, default: false },
    },
    currentUnit: {
      type: Number,
      default: 1,
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    hearts: {
      type: Number,
      default: 5,
    },
    dailyGoal: {
      type: Number,
      default: 50, // default target XP per day
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    unlockedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    completedLessons: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        completedAt: { type: Date, default: Date.now },
        stars: { type: Number, min: 1, max: 3, default: 3 },
        xpEarned: { type: Number, default: 15 },
      },
    ],
    pronunciationScores: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        phrase: String,
        score: { type: Number, min: 0, max: 100 },
        language: { type: String, enum: SUPPORTED_LANGUAGES },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    aiRecommendations: [
      {
        focusArea: String,
        recommendation: String,
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    learningAnalytics: {
      learningSpeed: { type: String, enum: ['slow', 'steady', 'fast'], default: 'steady' },
      strongTopics: [String],
      weakTopics: [String],
      studyFrequency: { type: Number, default: 0 },
      readingAbility: { type: Number, default: 0 },
      writingAbility: { type: Number, default: 0 },
      listeningAbility: { type: Number, default: 0 },
      speakingAbility: { type: Number, default: 0 },
    },
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    badges: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
