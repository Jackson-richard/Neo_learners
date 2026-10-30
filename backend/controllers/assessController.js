const Assessment = require('../models/Assessment');
const Question = require('../models/Question');

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { status: 'published' };
    const assessments = await Assessment.find(query).populate('questions');
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('questions');
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (req.user.role !== 'admin' && assessment.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private/Admin
exports.createAssessment = async (req, res, next) => {
  try {
    const { title, description, type, difficulty, status } = req.body;

    const assessment = await Assessment.create({
      title,
      description,
      type,
      difficulty,
      status: status || 'draft',
      questions: [],
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment metadata
// @route   PUT /api/assessments/:id
// @access  Private/Admin
exports.updateAssessment = async (req, res, next) => {
  try {
    let assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('questions');

    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private/Admin
exports.deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Delete associated questions
    await Question.deleteMany({ assessmentId: assessment._id });
    await assessment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a question to an assessment
// @route   POST /api/assessments/:id/questions
// @access  Private/Admin
exports.addQuestion = async (req, res, next) => {
  try {
    const assessmentId = req.params.id;
    const { type, text, options, correctAnswer, difficulty, points } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const question = await Question.create({
      assessmentId,
      type,
      text,
      options: options || [],
      correctAnswer,
      difficulty,
      points: points || 10,
    });

    assessment.questions.push(question._id);
    await assessment.save();

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific question
// @route   PUT /api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const assessment = await Assessment.findById(question.assessmentId);
    if (assessment) {
      assessment.questions = assessment.questions.filter(
        (qId) => qId.toString() !== question._id.toString()
      );
      await assessment.save();
    }

    await question.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
