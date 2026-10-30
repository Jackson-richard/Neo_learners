const Lesson = require('../models/Lesson');
const LessonTranslation = require('../models/LessonTranslation');

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Private
exports.getLessons = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : {
      status: 'published',
      language: req.user.learningLanguage || 'English',
    };
    if (req.user.role === 'admin' && req.query.language) {
      query.language = req.query.language;
    }

    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }

    if (req.query.unit) {
      query.unit = parseInt(req.query.unit, 10);
    }

    const lessons = await Lesson.find(query).sort({ unit: 1, order: 1, createdAt: 1 }).populate('translations');
    res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('translations');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (req.user.role !== 'admin' && lesson.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role !== 'admin' && lesson.language !== (req.user.learningLanguage || 'English')) {
      return res.status(403).json({ success: false, message: 'Lesson is not part of your learning language path' });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a base lesson
// @route   POST /api/lessons
// @access  Private/Admin
exports.createLesson = async (req, res, next) => {
  try {
    const { title, description, difficulty, estimatedDuration, category, status, language, learningMaterials, vocabulary, exercises, unit, order, xpReward } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      difficulty,
      estimatedDuration,
      category,
      language: language || 'English',
      status: status || 'draft',
      learningMaterials,
      vocabulary: vocabulary || [],
      exercises: exercises || [],
      unit: unit || 1,
      order: order || 0,
      xpReward: xpReward || 15,
      translations: [],
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Update base lesson metadata
// @route   PUT /api/lessons/:id
// @access  Private/Admin
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('translations');

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Delete associated translations
    await LessonTranslation.deleteMany({ lessonId: lesson._id });
    await lesson.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update lesson translation
// @route   POST /api/lessons/:id/translations
// @access  Private/Admin
exports.addTranslation = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const { language, title, description, learningMaterials, exercises, status } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check if translation already exists for this language
    let translation = await LessonTranslation.findOne({ lessonId, language });

    if (translation) {
      // Update existing translation
      translation.title = title;
      translation.description = description;
      translation.learningMaterials = learningMaterials;
      translation.exercises = exercises;
      translation.status = status || 'draft';
      await translation.save();
    } else {
      // Create new translation
      translation = await LessonTranslation.create({
        lessonId,
        language,
        title,
        description,
        learningMaterials,
        exercises,
        status: status || 'draft',
      });

      // Reference translation in lesson model
      lesson.translations.push(translation._id);
      await lesson.save();
    }

    res.status(200).json({ success: true, data: translation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a translation from a lesson
// @route   DELETE /api/lessons/:id/translations/:lang
// @access  Private/Admin
exports.deleteTranslation = async (req, res, next) => {
  try {
    const { id, lang } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const translation = await LessonTranslation.findOne({ lessonId: id, language: lang });
    if (!translation) {
      return res.status(404).json({ success: false, message: 'Translation not found' });
    }

    // Remove reference from lesson
    lesson.translations = lesson.translations.filter(
      (transId) => transId.toString() !== translation._id.toString()
    );
    await lesson.save();

    // Delete from db
    await translation.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a lesson and record progression
// @route   POST /api/lessons/:id/complete
// @access  Private/Learner
exports.completeLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add Lesson to completed array, if not already completed
    const hasCompleted = user.completedLessons.some(cl => cl.lessonId.toString() === lesson._id.toString());

    // Reward Gamification logic
    const xpReward = lesson.xpReward || 15;
    if (!hasCompleted) {
      user.completedLessons.push({
        lessonId: lesson._id,
        stars: 3,
        xpEarned: xpReward
      });
      user.xp += xpReward;
    } else {
      // Re-practice reward
      user.xp += 5;
    }

    // Streak checking
    const now = new Date();
    const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;

    if (!lastActiveDate) {
      user.streak = 1;
    } else {
      const diffTime = Math.abs(now.setHours(0, 0, 0, 0) - lastActiveDate.setHours(0, 0, 0, 0));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    }
    user.lastActive = new Date();

    // Educational Progression Engine: Auto-advance Unit & Level based strictly on rigid criteria
    // Condition: 20 Activities = 1 Unit. 15 Units = 1 Level.
    let updatedUnit = false;
    let updatedLevel = false;

    if (lesson.activityNumber >= 20 && user.currentUnit === lesson.unit) {
      // Completed the final activity of the current unit
      user.currentUnit += 1;
      updatedUnit = true;

      // Check if level should advance
      if (user.currentUnit > 15) {
        if (user.currentLevel === 'Beginner') {
          user.currentLevel = 'Intermediate';
          user.currentUnit = 1;
          updatedLevel = true;
        } else if (user.currentLevel === 'Intermediate') {
          user.currentLevel = 'Advanced';
          user.currentUnit = 1;
          updatedLevel = true;
        } else if (user.currentLevel === 'Advanced') {
          // Keep it at 15 for Advanced graduation state
          user.currentUnit = 15;
          // Could add graduating achievement here
        }
      }
    }

    // Achievement Unlock logic
    const hasAchievement = (title) => user.achievements.some(a => a.title === title);
    if (updatedUnit && !hasAchievement(`Completed Unit ${lesson.unit}`)) {
      user.achievements.push({ title: `Completed Unit ${lesson.unit}`, description: 'Mastered 20 activities!' });
    }
    if (updatedLevel && !hasAchievement(`Level Up: ${user.currentLevel}`)) {
      user.achievements.push({ title: `Level Up: ${user.currentLevel}`, description: 'Advanced to a new difficulty level!' });
    }

    await user.save();

    res.status(200).json({
      success: true,
      xpEarned: hasCompleted ? 5 : xpReward,
      totalXp: user.xp,
      streak: user.streak,
      levelUp: updatedLevel,
      unitUp: updatedUnit,
      currentLevel: user.currentLevel,
      currentUnit: user.currentUnit
    });
  } catch (error) {
    next(error);
  }
};

