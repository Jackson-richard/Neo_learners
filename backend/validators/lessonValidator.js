const { body } = require('express-validator');

exports.lessonRules = [
  body('title').trim().notEmpty().withMessage('Lesson title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('difficulty')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Difficulty must be Beginner, Intermediate, or Advanced'),
  body('estimatedDuration')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive number in minutes'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
];

exports.translationRules = [
  body('language')
    .isIn(['English', 'Tamil', 'Hindi', 'Kannada', 'Telugu', 'Malayalam'])
    .withMessage('Language must be English, Tamil, Hindi, Kannada, Telugu, or Malayalam'),
  body('title').trim().notEmpty().withMessage('Translated title is required'),
  body('description').trim().notEmpty().withMessage('Translated description is required'),
  body('learningMaterials').notEmpty().withMessage('Learning materials are required'),
  body('exercises').isArray().withMessage('Exercises must be an array'),
  body('exercises.*.question').notEmpty().withMessage('Exercise question is required'),
  body('exercises.*.correctAnswer').notEmpty().withMessage('Exercise correct answer is required'),
  body('exercises.*.options')
    .optional()
    .isArray()
    .withMessage('Exercise options must be an array of strings'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
];
