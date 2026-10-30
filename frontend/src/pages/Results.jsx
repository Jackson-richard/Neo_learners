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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { AuthContext } from '../context/AuthContext';
import { useAxios } from '../hooks/useAxios';

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const api = useAxios();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  
  // Drill-down result detail modal
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailedResult, setDetailedResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results');
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [api]);

  const handleOpenDetails = async (id) => {
    try {
      setDetailLoading(true);
      setOpenDetailDialog(true);
      const res = await api.get(`/results/${id}`);
      setDetailedResult(res.data.data);
    } catch (err) {
      console.error('Error fetching result details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const getProficiencyColor = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'success';
      case 'Intermediate': return 'primary';
      case 'Beginner':
      default: return 'warning';
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Student Logs & Scores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View full score records and check student profile data.
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ border: '2px solid #e5e5e5', borderRadius: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email / Demographics</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assessment Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Overall Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reading / Writing / Comp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No student logs recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 800 }}>{row.userId?.name || 'Deleted Learner'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.userId?.email || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Age: {row.userId?.age || 'N/A'} | Ed: {row.userId?.education || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.assessmentId?.title || 'General Quiz'}</TableCell>
                    <TableCell sx={{ fontWeight: 900, color: 'primary.main' }}>{row.scores?.overall}%</TableCell>
                    <TableCell>
                      <Typography variant="body2">R: {row.scores?.reading}% | W: {row.scores?.writing}% | C: {row.scores?.comprehension}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.proficiency} color={getProficiencyColor(row.proficiency)} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{new Date(row.completedAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(row._id)}>
                        Answers
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detailed result dialog */}
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Student Submission Detail</DialogTitle>
          <DialogContent divider sx={{ pt: 1 }}>
            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : detailedResult ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Learner Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{detailedResult.userId?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Quiz Title</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{detailedResult.assessmentId?.title}</Typography>
                </Box>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Response Checklist</Typography>
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {detailedResult.responses?.map((resp, idx) => (
                    <Box key={resp._id} sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Q{idx + 1}: {resp.questionId?.text}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Student Selected: <strong>{resp.selectedAnswer}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Correct Answer: <strong>{resp.questionId?.correctAnswer}</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        {resp.isCorrect ? (
                          <Chip size="small" icon={<CheckCircleIcon />} label="Correct" color="success" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Chip size="small" icon={<CancelIcon />} label="Incorrect" color="error" sx={{ fontWeight: 700 }} />
                        )}
                        <Typography variant="caption">{resp.score} Points Earned</Typography>
                      </Box>
                    </Box>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography variant="body2">Error loading details.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ==================== LEARNER LAYOUT ====================
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          Your Assessment History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your overall performance scores, reading, writing, and comprehension breakdowns below.
        </Typography>
      </Box>

      {results.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          You have not taken any assessments yet. Access the Assessments tab to check your literacy skills!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {results.map((res) => (
            <Grid item xs={12} key={res._id}>
              <Card sx={{ border: '2px solid #e5e5e5', borderRadius: 4 }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                      <Chip label={res.assessmentId?.type} color="primary" size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={res.proficiency} color={getProficiencyColor(res.proficiency)} size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {res.assessmentId?.title || 'General Quiz'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed on: {new Date(res.completedAt).toLocaleDateString()}
                    </Typography>

                    {/* Breakdown */}
                    <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" block sx={{ fontWeight: 700 }}>Reading</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{res.scores?.reading}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" block sx={{ fontWeight: 700 }}>Writing</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{res.scores?.writing}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" block sx={{ fontWeight: 700 }}>Comprehension</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{res.scores?.comprehension}%</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 950 }}>
                      {res.scores?.overall}%
                    </Typography>
                    <Button variant="outlined" color="primary" startIcon={<VisibilityIcon />} onClick={() => handleOpenDetails(res._id)}>
                      Review Answers
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detailed answers review dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Review Answers & Score breakdown</DialogTitle>
        <DialogContent divider>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : detailedResult ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {detailedResult.assessmentId?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Grade: <strong>{detailedResult.scores?.overall}%</strong> (Level: <strong>{detailedResult.proficiency}</strong>)
              </Typography>
              <Divider />
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {detailedResult.responses?.map((resp, idx) => (
                  <Box key={resp._id} sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Q{idx + 1}: {resp.questionId?.text}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Your Answer: <strong>{resp.selectedAnswer}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Correct Answer: <strong>{resp.questionId?.correctAnswer}</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      {resp.isCorrect ? (
                        <Chip size="small" icon={<CheckCircleIcon />} label="Correct" color="success" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Chip size="small" icon={<CancelIcon />} label="Incorrect" color="error" sx={{ fontWeight: 700 }} />
                      )}
                      <Typography variant="caption">{resp.score} Points</Typography>
                    </Box>
                  </Box>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body2">Error loading details.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultsPage;
