const { body } = require('express-validator');

exports.curriculumRules = [
  body('title').trim().notEmpty().withMessage('Curriculum title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  body('lessons')
    .optional()
    .isArray()
    .withMessage('Lessons must be an array of ObjectIds'),
];
