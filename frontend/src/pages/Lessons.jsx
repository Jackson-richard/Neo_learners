import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import TranslateIcon from '@mui/icons-material/Translate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AuthContext } from '../context/AuthContext';
import { useAxios } from '../hooks/useAxios';
import { useNavigate } from 'react-router-dom';

const LessonsPage = () => {
  const { user } = useContext(AuthContext);
  const api = useAxios();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);

  // Base lesson dialog state
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editLessonId, setEditLessonId] = useState(null);
  const [lessonError, setLessonError] = useState('');
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    estimatedDuration: 15,
    category: '',
    status: 'draft',
  });

  // AI Lesson Generator dialog states
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiForm, setAiForm] = useState({
    category: 'Daily Words',
    difficulty: 'Beginner',
  });
  const [aiPreview, setAiPreview] = useState(null);

  // Translation dialog state
  const [openTransDialog, setOpenTransDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [transError, setTransError] = useState('');
  const [transForm, setTransForm] = useState({
    language: 'English',
    title: '',
    description: '',
    learningMaterials: '',
    exercises: [], // Array of { question, options, correctAnswer }
  });

  // Exercise adding state inside Translation
  const [newExercise, setNewExercise] = useState({
    question: '',
    optionString: '', // comma separated options
    correctAnswer: '',
  });

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lessons');
      setLessons(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [api]);

  const handleOpenAddLesson = () => {
    setIsEditingLesson(false);
    setLessonForm({
      title: '',
      description: '',
      difficulty: 'Beginner',
      estimatedDuration: 15,
      category: '',
      status: 'draft',
    });
    setLessonError('');
    setOpenLessonDialog(true);
  };

  const handleOpenEditLesson = (lesson) => {
    setIsEditingLesson(true);
    setEditLessonId(lesson._id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      estimatedDuration: lesson.estimatedDuration,
      category: lesson.category,
      status: lesson.status,
    });
    setLessonError('');
    setOpenLessonDialog(true);
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Deleting this lesson will cascade-delete all language translations. Proceed?')) {
      try {
        await api.delete(`/lessons/${id}`);
        loadLessons();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setLessonError('');
    try {
      if (isEditingLesson) {
        await api.put(`/lessons/${editLessonId}`, lessonForm);
      } else {
        await api.post('/lessons', lessonForm);
      }
      setOpenLessonDialog(false);
      loadLessons();
    } catch (err) {
      setLessonError(err.response?.data?.message || err.response?.data?.error || 'Validation error');
    }
  };

  // AI Generator Operations
  const handleOpenAiGenerator = () => {
    setAiForm({ category: 'Daily Words', difficulty: 'Beginner' });
    setAiPreview(null);
    setAiError('');
    setOpenAiDialog(true);
  };

  const handleTriggerAiGeneration = async () => {
    setAiGenerating(true);
    setAiError('');
    try {
      const res = await api.post('/ai/generate-lesson', {
        category: aiForm.category,
        difficulty: aiForm.difficulty,
      });

      if (res.data.success) {
        setAiPreview(res.data.data);
      }
    } catch (err) {
      setAiError(err.response?.data?.message || err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveAiGeneratedLesson = async () => {
    if (!aiPreview) return;
    try {
      setAiGenerating(true);
      // 1. Create base lesson
      const baseLessonRes = await api.post('/lessons', {
        title: aiPreview.title,
        description: aiPreview.description,
        difficulty: aiForm.difficulty,
        estimatedDuration: 15,
        category: aiForm.category,
        status: 'published',
      });

      if (baseLessonRes.data.success) {
        const newLesson = baseLessonRes.data.data;
        // 2. Save translation details
        await api.post(`/lessons/${newLesson._id}/translations`, {
          language: user.learningLanguage || 'English',
          title: aiPreview.title,
          description: aiPreview.description,
          learningMaterials: aiPreview.learningMaterials,
          exercises: aiPreview.exercises || [],
          status: 'published',
        });

        setOpenAiDialog(false);
        loadLessons();
      }
    } catch (err) {
      setAiError('Failed to save generated lesson details.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Translations Operations
  const handleOpenTranslations = (lesson) => {
    setSelectedLesson(lesson);
    setTransForm({
      language: 'English',
      title: '',
      description: '',
      learningMaterials: '',
      exercises: [],
    });
    setNewExercise({ question: '', optionString: '', correctAnswer: '' });
    setTransError('');
    setOpenTransDialog(true);
  };

  const handleLanguageChange = async (lang) => {
    setTransForm(prev => ({ ...prev, language: lang }));
    const existing = selectedLesson.translations?.find(t => t.language === lang);
    if (existing) {
      setTransForm({
        language: lang,
        title: existing.title,
        description: existing.description,
        learningMaterials: existing.learningMaterials,
        exercises: existing.exercises || [],
      });
    } else {
      setTransForm({
        language: lang,
        title: '',
        description: '',
        learningMaterials: '',
        exercises: [],
      });
    }
  };

  const handleAddExerciseLocal = () => {
    if (!newExercise.question || !newExercise.correctAnswer) {
      alert('Exercise question and correct answer are required.');
      return;
    }
    const options = newExercise.optionString
      ? newExercise.optionString.split(',').map(o => o.trim())
      : [];

    setTransForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        question: newExercise.question,
        options,
        correctAnswer: newExercise.correctAnswer
      }]
    }));

    setNewExercise({ question: '', optionString: '', correctAnswer: '' });
  };

  const handleRemoveExerciseLocal = (index) => {
    setTransForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleTranslationSubmit = async (e) => {
    e.preventDefault();
    setTransError('');
    try {
      await api.post(`/lessons/${selectedLesson._id}/translations`, transForm);
      setOpenTransDialog(false);
      loadLessons();
    } catch (err) {
      setTransError(err.response?.data?.message || err.response?.data?.error || 'Failed saving translation');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Advanced': return 'error';
      case 'Intermediate': return 'primary';
      case 'Beginner':
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Admin/Teacher Layout
  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Manage Lessons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create modular lessons, edit multi-lingual translations, or auto-generate courses using Gemini AI.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary" startIcon={<AutoAwesomeIcon />} onClick={handleOpenAiGenerator} sx={{ py: 1.2, px: 3 }}>
            AI Generate Lesson
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenAddLesson} sx={{ py: 1.2, px: 3 }}>
            Add Lesson
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ border: '2px solid #e5e5e5', borderRadius: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title (Base)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Translations</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No lessons found. Create a base lesson metadata record or use "AI Generate Lesson".
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson._id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{lesson.title}</TableCell>
                  <TableCell>{lesson.category}</TableCell>
                  <TableCell>
                    <Chip label={lesson.difficulty} color={getDifficultyColor(lesson.difficulty)} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{lesson.estimatedDuration} mins</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {['English', 'Hindi', 'Tamil', 'Telugu'].map((lang) => {
                        const hasTrans = lesson.translations?.some(t => t.language === lang);
                        return (
                          <Chip
                            key={lang}
                            label={lang.substring(0, 2).toUpperCase()}
                            color={hasTrans ? 'primary' : 'default'}
                            size="small"
                            variant={hasTrans ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                          />
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={lesson.status} color={lesson.status === 'published' ? 'secondary' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="secondary" onClick={() => handleOpenTranslations(lesson)} title="Manage translations">
                      <TranslateIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleOpenEditLesson(lesson)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteLesson(lesson._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AI Generator dialog */}
      <Dialog open={openAiDialog} onClose={() => setOpenAiDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          🪄 AI Lesson Generator Wizard
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {aiError && <Alert severity="error">{aiError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Topic / Category"
                placeholder="e.g., Household Items, Weather"
                value={aiForm.category}
                onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={aiForm.difficulty}
                  label="Difficulty"
                  onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            disabled={aiGenerating}
            onClick={handleTriggerAiGeneration}
            startIcon={aiGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          >
            {aiGenerating ? 'AI is drafting content...' : 'Draft Content with Gemini'}
          </Button>

          {aiPreview && (
            <Box sx={{ border: '2px solid #e5e5e5', borderRadius: 3, p: 3, bgcolor: '#fbfbfb' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                Preview: {aiPreview.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {aiPreview.description}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                {aiPreview.learningMaterials}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Drafted Exercise:
              </Typography>
              {aiPreview.exercises?.map((ex, i) => (
                <Box key={i} sx={{ border: '1px solid #e5e5e5', p: 2, borderRadius: 2, bgcolor: '#fff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Q: {ex.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Options: {ex.options?.join(', ')} | Correct: {ex.correctAnswer}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAiDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAiGeneratedLesson}
            variant="contained"
            color="secondary"
            disabled={!aiPreview || aiGenerating}
          >
            Save Draft as Published Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Base Lesson metadata Create/Edit dialog */}
      <Dialog open={openLessonDialog} onClose={() => setOpenLessonDialog(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleLessonSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{isEditingLesson ? 'Edit Lesson Metadata' : 'Create Lesson Metadata'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {lessonError && <Alert severity="error">{lessonError}</Alert>}
            <TextField
              required
              fullWidth
              label="Base Title"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            />
            <TextField
              required
              fullWidth
              multiline
              rows={2}
              label="Base Description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={lessonForm.difficulty}
                    label="Difficulty"
                    onChange={(e) => setLessonForm({ ...lessonForm, difficulty: e.target.value })}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  value={lessonForm.estimatedDuration}
                  onChange={(e) => setLessonForm({ ...lessonForm, estimatedDuration: parseInt(e.target.value, 10) })}
                />
              </Grid>
            </Grid>
            <TextField
              required
              fullWidth
              label="Category"
              placeholder="e.g. Alphabet, Words"
              value={lessonForm.category}
              onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={lessonForm.status}
                label="Status"
                onChange={(e) => setLessonForm({ ...lessonForm, status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenLessonDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Translation manager dialog */}
      <Dialog open={openTransDialog} onClose={() => setOpenTransDialog(false)} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleTranslationSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Translate Lesson: {selectedLesson?.title}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {transError && <Alert severity="error">{transError}</Alert>}
            <FormControl fullWidth>
              <InputLabel>Target Language</InputLabel>
              <Select
                value={transForm.language}
                label="Target Language"
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi (हिंदी)</MenuItem>
                <MenuItem value="Tamil">Tamil (தமிழ்)</MenuItem>
                <MenuItem value="Telugu">Telugu (తెలుగు)</MenuItem>
                <MenuItem value="Kannada">Kannada (ಕನ್ನಡ)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label="Translated Title"
              value={transForm.title}
              onChange={(e) => setTransForm({ ...transForm, title: e.target.value })}
            />
            <TextField
              required
              fullWidth
              label="Translated Description"
              value={transForm.description}
              onChange={(e) => setTransForm({ ...transForm, description: e.target.value })}
            />
            <TextField
              required
              fullWidth
              multiline
              rows={6}
              label="Learning Materials (Markdown content)"
              placeholder="# Unit Topic\nWrite text materials here..."
              value={transForm.learningMaterials}
              onChange={(e) => setTransForm({ ...transForm, learningMaterials: e.target.value })}
            />

            <Divider />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Practice Exercises
            </Typography>

            <List sx={{ border: '1px solid #e5e5e5', borderRadius: 3 }}>
              {transForm.exercises.length === 0 ? (
                <ListItem>
                  <ListItemText secondary="No practice exercises added for this language translation." />
                </ListItem>
              ) : (
                transForm.exercises.map((ex, idx) => (
                  <ListItem
                    key={idx}
                    secondaryAction={
                      <IconButton edge="end" color="error" onClick={() => handleRemoveExerciseLocal(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`Q${idx + 1}: ${ex.question}`}
                      secondary={`Options: ${ex.options?.join(', ') || 'Text Input'} | Correct: ${ex.correctAnswer}`}
                    />
                  </ListItem>
                ))
              )}
            </List>

            <Box sx={{ border: '2px dashed #e5e5e5', p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Add New Practice Exercise
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Exercise Question text"
                    value={newExercise.question}
                    onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Multiple Choice Options (comma separated)"
                    placeholder="Opt A, Opt B, Opt C"
                    value={newExercise.optionString}
                    onChange={(e) => setNewExercise({ ...newExercise, optionString: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Correct Answer value"
                    value={newExercise.correctAnswer}
                    onChange={(e) => setNewExercise({ ...newExercise, correctAnswer: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddExerciseLocal}
                sx={{ mt: 2 }}
              >
                Add Exercise
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenTransDialog(false)}>Close</Button>
            <Button type="submit" variant="contained" color="secondary">Save Translation</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default LessonsPage;
