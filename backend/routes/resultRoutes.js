const express = require('express');
const router = express.Router();
const {
  submitResponses,
  getResults,
  getResult,
  getUserResults,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require login

// Allow both POST /api/responses and POST /api/results to submit answers
router.post('/responses', submitResponses);
router.post('/results', submitResponses);

// Fetch results
router.get('/results', getResults);
router.get('/results/:id', getResult);
router.get('/results/user/:userId', authorize('admin'), getUserResults);

// Get responses history (Optional helper)
router.get('/responses', async (req, res, next) => {
  try {
    const Response = require('../models/Response');
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const responses = await Response.find(query)
      .populate('questionId', 'text type')
      .populate('assessmentId', 'title type');
    res.status(200).json({ success: true, count: responses.length, data: responses });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
