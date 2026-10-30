const Curriculum = require('../models/Curriculum');

// @desc    Get all curricula
// @route   GET /api/curriculum
// @access  Private
exports.getCurricula = async (req, res, next) => {
  try {
    const userLanguage = req.user.learningLanguage || 'English';
    const query = { language: userLanguage };

    // Learners can only view published curricula; admins can view all for that language (or we could omit language for admin to see all)
    if (req.user.role !== 'admin') {
      query.status = 'published';
    } else {
      // If admin, maybe return all regardless of language, but let's stick to user language for now or rely on query params
      if (req.query.language) {
        query.language = req.query.language;
      } else {
        delete query.language; // Admin sees all by default
      }
    }

    const curricula = await Curriculum.find(query)
      .sort({ order: 1 })
      .populate('lessons');

    res.status(200).json({ success: true, count: curricula.length, data: curricula });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single curriculum by ID
// @route   GET /api/curriculum/:id
// @access  Private
exports.getCurriculum = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id).populate('lessons');
    if (!curriculum) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' });
    }

    // Role-based status guard
    if (req.user.role !== 'admin' && curriculum.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: curriculum });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new curriculum
// @route   POST /api/curriculum
// @access  Private/Admin
exports.createCurriculum = async (req, res, next) => {
  try {
    const { title, description, language, difficulty, order, status, lessons } = req.body;

    const curriculum = await Curriculum.create({
      title,
      description,
      language: language || 'English',
      difficulty,
      order: order || 0,
      status: status || 'draft',
      lessons: lessons || [],
    });

    res.status(201).json({ success: true, data: curriculum });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing curriculum
// @route   PUT /api/curriculum/:id
// @access  Private/Admin
exports.updateCurriculum = async (req, res, next) => {
  try {
    let curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' });
    }

    curriculum = await Curriculum.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: curriculum });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a curriculum
// @route   DELETE /api/curriculum/:id
// @access  Private/Admin
exports.deleteCurriculum = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' });
    }

    await curriculum.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
