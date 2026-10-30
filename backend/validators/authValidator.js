const { body } = require('express-validator');

const supportedLanguages = ['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam'];
const learningGoals = ['Literacy', 'School', 'Career', 'Travel', 'Personal Development'];
const levels = ['Beginner', 'Intermediate', 'Advanced', 'AI Placement'];

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('age').isInt({ min: 1 }).withMessage('Age must be a valid positive integer'),
  body('education').trim().notEmpty().withMessage('Education background is required'),
  body('nativeLanguage')
    .optional()
    .isIn(supportedLanguages)
    .withMessage('Native Language is not supported'),
  body('learningLanguage')
    .optional()
    .isIn(supportedLanguages)
    .withMessage('Learning Language is not supported'),
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'learner'])
    .withMessage('Role must be admin, teacher, or learner'),
  body('reasonForLearning').optional().isIn(learningGoals),
  body('experienceLevel').optional().isIn(levels),
  body('proficiencyScore').optional().isNumeric(),
  body('proficiencyLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('currentLevel').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('placementPreference').optional().isIn(['manual', 'ai']),
  body('placementResults').optional().isObject(),
  body('accessibility').optional().isObject(),
];

exports.loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
