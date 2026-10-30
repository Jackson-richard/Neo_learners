const Result = require('../models/Result');
const scoreService = require('../services/scoreService');

// @desc    Submit answers for grading & retrieve result score
// @route   POST /api/responses/submit
// @access  Private
exports.submitResponses = async (req, res, next) => {
  try {
    const { assessmentId, submissions } = req.body;
    const userId = req.user.id;

    if (!assessmentId || !submissions || !Array.isArray(submissions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assessmentId and an array of submissions',
      });
    }

    // Call service to grade questions, save responses, calculate scores and proficiency
    const result = await scoreService.gradeAssessment(userId, assessmentId, submissions);

    // Populate user and assessment info for response
    const populatedResult = await Result.findById(result._id)
      .populate('userId', 'name email learningLanguage')
      .populate('assessmentId', 'title type difficulty');

    res.status(201).json({ success: true, data: populatedResult });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment results
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    let results;

    if (req.user.role === 'admin') {
      // Admin sees everyone's scores
      results = await Result.find()
        .populate('userId', 'name email nativeLanguage learningLanguage age education')
        .populate('assessmentId', 'title type difficulty')
        .sort({ createdAt: -1 });
    } else {
      // Learners only see their own scores
      results = await Result.find({ userId: req.user.id })
        .populate('userId', 'name email learningLanguage')
        .populate('assessmentId', 'title type difficulty')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single result by ID
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('userId', 'name email nativeLanguage learningLanguage age education')
      .populate('assessmentId', 'title type difficulty')
      .populate({
        path: 'responses',
        populate: {
          path: 'questionId',
          select: 'text type options correctAnswer points difficulty',
        },
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Role check: Learners cannot view other users' results
    if (req.user.role !== 'admin' && result.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for a specific learner user
// @route   GET /api/results/user/:userId
// @access  Private/Admin
exports.getUserResults = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate('userId', 'name email learningLanguage')
      .populate('assessmentId', 'title type difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};
