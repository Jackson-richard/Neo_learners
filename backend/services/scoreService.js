const Question = require('../models/Question');
const Response = require('../models/Response');
const Result = require('../models/Result');

/**
 * Grades a batch of responses and calculates the score for a specific assessment.
 * @param {string} userId - ID of the learner
 * @param {string} assessmentId - ID of the assessment
 * @param {Array} submissions - Array of { questionId, selectedAnswer }
 * @returns {Object} result - Calculated result object with score details
 */
exports.gradeAssessment = async (userId, assessmentId, submissions) => {
  let totalPointsPossible = 0;
  let totalPointsScored = 0;

  // Track scores by question type
  const typePointsPossible = { Reading: 0, Writing: 0, Comprehension: 0 };
  const typePointsScored = { Reading: 0, Writing: 0, Comprehension: 0 };

  const savedResponses = [];

  for (const sub of submissions) {
    const question = await Question.findById(sub.questionId);
    if (!question) continue;

    // Check if the answer is correct
    // Trim and case-insensitive check for text, or direct option match
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();
    const cleanSelected = sub.selectedAnswer.trim().toLowerCase();
    const isCorrect = cleanCorrect === cleanSelected;
    
    const pointsScored = isCorrect ? question.points : 0;

    // Accumulate total points
    totalPointsPossible += question.points;
    totalPointsScored += pointsScored;

    // Accumulate points by type
    if (typePointsPossible[question.type] !== undefined) {
      typePointsPossible[question.type] += question.points;
      typePointsScored[question.type] += pointsScored;
    }

    // Save individual response
    const response = await Response.create({
      userId,
      assessmentId,
      questionId: sub.questionId,
      selectedAnswer: sub.selectedAnswer,
      isCorrect,
      score: pointsScored,
    });

    savedResponses.push(response._id);
  }

  // Calculate percentage scores
  const getPercentage = (scored, possible) => {
    if (possible === 0) return 0;
    return Math.round((scored / possible) * 100);
  };

  const readingPercentage = getPercentage(typePointsScored.Reading, typePointsPossible.Reading);
  const writingPercentage = getPercentage(typePointsScored.Writing, typePointsPossible.Writing);
  const comprehensionPercentage = getPercentage(typePointsScored.Comprehension, typePointsPossible.Comprehension);
  const overallPercentage = getPercentage(totalPointsScored, totalPointsPossible);

  // Determine proficiency: 0-40 Beginner, 41-70 Intermediate, 71-100 Advanced
  let proficiency = 'Beginner';
  if (overallPercentage > 70) {
    proficiency = 'Advanced';
  } else if (overallPercentage > 40) {
    proficiency = 'Intermediate';
  }

  // Save assessment result log
  const result = await Result.create({
    userId,
    assessmentId,
    scores: {
      reading: readingPercentage,
      writing: writingPercentage,
      comprehension: comprehensionPercentage,
      overall: overallPercentage,
    },
    responses: savedResponses,
    proficiency,
  });

  // Update user XP, Streak, Hearts, and check achievements
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      // 1. Add XP
      user.xp += totalPointsScored;

      // 2. Hearts modification: Deduct if failed (overall < 50%), reward if perfect
      if (overallPercentage < 50) {
        user.hearts = Math.max(0, user.hearts - 1);
      } else if (overallPercentage === 100) {
        user.hearts = Math.min(5, user.hearts + 1);
      }

      // 3. Streak calculation
      const now = new Date();
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      
      if (!lastActiveDate) {
        user.streak = 1;
      } else {
        const diffTime = Math.abs(now.setHours(0,0,0,0) - lastActiveDate.setHours(0,0,0,0));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
        // If diffDays is 0 (same day), streak stays the same
      }
      user.lastActive = new Date();

      // 4. Achievement unlocking check
      const hasAchievement = (title) => user.achievements.some(a => a.title === title);
      
      if (user.xp >= 100 && !hasAchievement('XP Collector')) {
        user.achievements.push({ title: 'XP Collector', description: 'Accumulate more than 100 XP overall!' });
      }
      if (user.streak >= 3 && !hasAchievement('Streak Starter')) {
        user.achievements.push({ title: 'Streak Starter', description: 'Maintain a 3-day learning streak.' });
      }
      if (overallPercentage === 100 && !hasAchievement('Perfectionist')) {
        user.achievements.push({ title: 'Perfectionist', description: 'Score a perfect 100% on any assessment.' });
      }

      await user.save();
    }
  } catch (err) {
    console.error('Error updating user gamified stats during grading:', err);
  }

  return result;
};
