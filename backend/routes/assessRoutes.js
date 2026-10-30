const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/assessController');
const { assessmentRules, questionRules } = require('../validators/assessValidator');
const { validate } = require('../middleware/valMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All assessment routes require authentication

router.route('/')
  .get(getAssessments)
  .post(authorize('admin'), assessmentRules, validate, createAssessment);

router.route('/:id')
  .get(getAssessment)
  .put(authorize('admin'), assessmentRules, validate, updateAssessment)
  .delete(authorize('admin'), deleteAssessment);

// Sub-routes for questions within assessments
router.route('/:id/questions')
  .post(authorize('admin'), questionRules, validate, addQuestion);

// Endpoints for individual question editing/deletion
router.route('/questions/:id')
  .put(authorize('admin'), questionRules, validate, updateQuestion)
  .delete(authorize('admin'), deleteQuestion);

module.exports = router;
