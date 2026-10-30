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
  Checkbox,
  ListItemText,
  OutlinedInput,
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
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AuthContext } from '../context/AuthContext';
import { useAxios } from '../hooks/useAxios';
import { useNavigate } from 'react-router-dom';

const CurriculumPage = () => {
  const { user } = useContext(AuthContext);
  const api = useAxios();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [curricula, setCurricula] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null); // For learner detail drill-down

  // Admin modal state
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    order: 0,
    status: 'draft',
    lessons: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const currRes = await api.get('/curriculum');
      setCurricula(currRes.data.data || []);

      if (user.role === 'admin') {
        const lessonRes = await api.get('/lessons');
        setLessons(lessonRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching curricula:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [api, user.role]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      order: curricula.length,
      status: 'draft',
      lessons: [],
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (curr) => {
    setIsEditing(true);
    setEditId(curr._id);
    setFormData({
      title: curr.title,
      description: curr.description,
      difficulty: curr.difficulty,
      order: curr.order,
      status: curr.status,
      lessons: curr.lessons ? curr.lessons.map(l => l._id || l) : [],
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this curriculum?')) {
      try {
        await api.delete(`/curriculum/${id}`);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isEditing) {
        await api.put(`/curriculum/${editId}`, formData);
      } else {
        await api.post('/curriculum', formData);
      }
      setOpenDialog(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Validation error saving curriculum');
    }
  };

  const handleLessonsSelectChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      lessons: typeof value === 'string' ? value.split(',') : value,
    });
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

  // ==================== ADMIN LAYOUT ====================
  if (user.role === 'admin') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Manage Curricula
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, update, delete study pathways and link lessons to them.
            </Typography>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ py: 1.2, px: 3 }}>
            Add Curriculum
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ border: '2px solid #e5e5e5', borderRadius: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Lessons</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {curricula.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No curricula found. Click "Add Curriculum" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                curricula.map((curr) => (
                  <TableRow key={curr._id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{curr.order}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{curr.title}</TableCell>
                    <TableCell>
                      <Chip label={curr.difficulty} color={getDifficultyColor(curr.difficulty)} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{curr.lessons?.length || 0} Lessons</TableCell>
                    <TableCell>
                      <Chip label={curr.status} color={curr.status === 'published' ? 'secondary' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(curr)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(curr._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <Box component="form" onSubmit={handleFormSubmit}>
            <DialogTitle sx={{ fontWeight: 800 }}>{isEditing ? 'Edit Curriculum' : 'Create Curriculum'}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <TextField
                required
                fullWidth
                label="Curriculum Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={formData.difficulty}
                      label="Difficulty"
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      sx={{ borderRadius: 3 }}
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
                    label="Order Index"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth sx={{ borderRadius: 3 }}>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>

              {/* Select Lessons checklist */}
              <FormControl fullWidth>
                <InputLabel id="lessons-checkbox-label">Associated Lessons</InputLabel>
                <Select
                  labelId="lessons-checkbox-label"
                  multiple
                  value={formData.lessons}
                  onChange={handleLessonsSelectChange}
                  input={<OutlinedInput label="Associated Lessons" />}
                  renderValue={(selected) => {
                    const selectedTitles = selected.map(id => lessons.find(l => l._id === id)?.title || id);
                    return selectedTitles.join(', ');
                  }}
                  sx={{ borderRadius: 3 }}
                >
                  {lessons.map((lesson) => (
                    <MenuItem key={lesson._id} value={lesson._id}>
                      <Checkbox checked={formData.lessons.indexOf(lesson._id) > -1} />
                      <ListItemText primary={lesson.title} secondary={`${lesson.category} (${lesson.difficulty})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save</Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    );
  }

  // ==================== LEARNER LAYOUT ====================
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 10 }}>
      {curricula.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="h5" color="text.secondary" fontWeight={800}>
            No pathways are published yet for your language. Check back soon!
          </Typography>
        </Box>
      ) : (
        curricula.map((unit, unitIndex) => (
          <Box key={unit._id} sx={{ mb: 6 }}>
            {/* Unit Header */}
            <Card sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 4,
              mb: 4,
              boxShadow: '0 8px 0 rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    Unit {unitIndex + 1}: {unit.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, opacity: 0.9 }}>
                    {unit.description}
                  </Typography>
                </Box>
                <Chip label={unit.difficulty} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }} />
              </CardContent>
            </Card>

            {/* Lesson Path Nodes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {(!unit.lessons || unit.lessons.length === 0) ? (
                <Typography color="text.secondary">No lessons in this unit.</Typography>
              ) : (
                unit.lessons.map((lesson, lessonIndex) => {
                  const isLocked = !user.unlockedLessons?.includes(lesson._id) && lessonIndex !== 0; // Simplified lock logic: first lesson always unlocked, or base it on user.unlockedLessons
                  const offset = lessonIndex % 2 === 0 ? -40 : 40; // Zig Zag effect

                  return (
                    <Box key={lesson._id} sx={{ position: 'relative', my: 2, transform: `translateX(${offset}px)` }}>
                      <Box
                        onClick={() => !isLocked && navigate(`/lessons/${lesson._id}`)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          bgcolor: isLocked ? '#e5e5e5' : 'secondary.main',
                          color: isLocked ? '#a0a0a0' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          boxShadow: isLocked ? '0 6px 0 #d0d0d0' : '0 6px 0 #9c27b0', // Adjust shadow color based on theme secondary
                          transition: 'transform 0.1s',
                          '&:hover': {
                            transform: isLocked ? 'none' : 'scale(1.05) translateY(-4px)',
                            boxShadow: isLocked ? '0 6px 0 #d0d0d0' : '0 10px 0 #9c27b0',
                          },
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          mt: 1,
                          fontWeight: 800,
                          color: isLocked ? 'text.secondary' : 'text.primary',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {lesson.title}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default CurriculumPage;
