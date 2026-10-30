const { body } = require('express-validator');

exports.assessmentRules = [
  body('title').trim().notEmpty().withMessage('Assessment title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type')
    .isIn(['Reading', 'Writing', 'Comprehension'])
    .withMessage('Assessment type must be Reading, Writing, or Comprehension'),
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
];

exports.questionRules = [
  body('type')
    .isIn(['Reading', 'Writing', 'Comprehension'])
    .withMessage('Question type must be Reading, Writing, or Comprehension'),
  body('text').trim().notEmpty().withMessage('Question text is required'),
  body('options')
    .optional()
    .isArray()
    .withMessage('Options must be an array of strings'),
  body('correctAnswer').trim().notEmpty().withMessage('Correct answer is required'),
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),
  body('points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
];
