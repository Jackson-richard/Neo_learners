const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const Result = require('../models/Result');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// @route   POST /api/ai/chat
// @desc    Interact with the patient literacy AI tutor (Gyan)
// @access  Private
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const learningLanguage = req.user.learningLanguage || 'English';
    const nativeLanguage = req.user.nativeLanguage || 'English';
    const latestResult = await Result.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const level = latestResult ? latestResult.proficiency : 'Beginner';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const reply = await geminiService.tutorChat(message, history || [], req.user);
    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/generate-lesson
// @desc    Generate a custom lesson on a topic
// @access  Private
router.post('/generate-lesson', async (req, res, next) => {
  try {
    const { difficulty, category } = req.body;
    const learningLanguage = req.user.learningLanguage || 'English';
    const nativeLanguage = req.user.nativeLanguage || 'English';

    const lesson = await geminiService.generateLesson(
      learningLanguage,
      difficulty || 'Beginner',
      category || 'Foundations',
      nativeLanguage
    );

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/generate-assessment
// @desc    Dynamically generate a smart quiz based on mistakes
// @access  Private
router.post('/generate-assessment', async (req, res, next) => {
  try {
    const { difficulty } = req.body;
    const learningLanguage = req.user.learningLanguage || 'English';
    const nativeLanguage = req.user.nativeLanguage || 'English';

    const Response = require('../models/Response');
    const wrongResponses = await Response.find({ userId: req.user.id, isCorrect: false })
      .populate('questionId', 'text')
      .limit(5);

    const mistakes = wrongResponses.map(r => r.questionId?.text).filter(Boolean);

    const questions = await geminiService.generateSmartAssessment(
      learningLanguage,
      difficulty || 'Beginner',
      mistakes,
      nativeLanguage
    );

    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/recommendations
// @desc    Get literacy weakness logs and focus recommendations
// @access  Private
router.get('/recommendations', async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recommendations = await geminiService.detectWeaknessesAndRecommend(
      results,
      req.user.learningLanguage || 'English',
      req.user.nativeLanguage || 'English'
    );

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/daily-plan
// @desc    Get personalized daily study goals checklist
// @access  Private
router.get('/daily-plan', async (req, res, next) => {
  try {
    const latestResult = await Result.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const level = latestResult ? latestResult.proficiency : 'Beginner';
    const learningLanguage = req.user.learningLanguage || 'English';
    const nativeLanguage = req.user.nativeLanguage || 'English';

    const plan = await geminiService.generateDailyPlan(learningLanguage, level, nativeLanguage);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/ai/story
// @desc    Generate a custom reading story with questions
// @access  Private
router.get('/story', async (req, res, next) => {
  try {
    const latestResult = await Result.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const level = latestResult ? latestResult.proficiency : 'Beginner';
    const learningLanguage = req.user.learningLanguage || 'English';

    const story = await geminiService.generateStory(learningLanguage, level);
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
