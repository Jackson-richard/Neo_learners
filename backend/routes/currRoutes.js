const express = require('express');
const router = express.Router();
const {
  getCurricula,
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} = require('../controllers/currController');
const { curriculumRules } = require('../validators/currValidator');
const { validate } = require('../middleware/valMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All curriculum routes require authentication

router.route('/')
  .get(getCurricula)
  .post(authorize('admin'), curriculumRules, validate, createCurriculum);

router.route('/:id')
  .get(getCurriculum)
  .put(authorize('admin'), curriculumRules, validate, updateCurriculum)
  .delete(authorize('admin'), deleteCurriculum);

module.exports = router;
