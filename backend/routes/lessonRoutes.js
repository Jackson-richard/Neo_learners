const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  addTranslation,
  deleteTranslation,
  completeLesson,
} = require('../controllers/lessonController');
const { lessonRules, translationRules } = require('../validators/lessonValidator');
const { validate } = require('../middleware/valMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All lesson routes require authentication

router.route('/')
  .get(getLessons)
  .post(authorize('admin'), lessonRules, validate, createLesson);

router.route('/:id')
  .get(getLesson)
  .put(authorize('admin'), lessonRules, validate, updateLesson)
  .delete(authorize('admin'), deleteLesson);

router.route('/:id/complete')
  .post(completeLesson);

router.route('/:id/translations')
  .post(authorize('admin'), translationRules, validate, addTranslation);

router.route('/:id/translations/:lang')
  .delete(authorize('admin'), deleteTranslation);

module.exports = router;
