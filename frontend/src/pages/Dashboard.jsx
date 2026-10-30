import React, { useContext, useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useAxios } from '../hooks/useAxios';
import { translate } from '../utils/i18n';

// Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const { speak } = useContext(AccessibilityContext);
  const api = useAxios();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    curriculaCount: 0,
    lessonsCount: 0,
    assessmentsCount: 0,
    resultsCount: 0,
  });

  const [recentResults, setRecentResults] = useState([]);
  const [allLessons, setAllLessons] = useState([]);

  // AI Dynamic features states
  const [dailyPlan, setDailyPlan] = useState([]);
  const [aiInsights, setAiInsights] = useState({ weaknesses: [], recommendations: [], summary: '' });
  const [loadingAi, setLoadingAi] = useState(false);
  const [refillingHearts, setRefillingHearts] = useState(false);

  const lang = user?.nativeLanguage || 'English';

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load stats
      const lessonUrl = user?.role === 'learner'
        ? `/lessons?difficulty=${user?.currentLevel || 'Beginner'}&unit=${user?.currentUnit || 1}`
        : '/lessons';

      const [currRes, lesRes, assessRes, resultsRes] = await Promise.all([
        api.get('/curriculum'),
        api.get(lessonUrl),
        api.get('/assessments'),
        api.get('/results'),
      ]);

      setStats({
        curriculaCount: currRes.data.count || 0,
        lessonsCount: lesRes.data.count || 0,
        assessmentsCount: assessRes.data.count || 0,
        resultsCount: resultsRes.data.count || 0,
      });

      setRecentResults(resultsRes.data.data ? resultsRes.data.data.slice(0, 5) : []);

      const lessonsData = lesRes.data.data || [];
      setAllLessons(lessonsData);

      // If user is learner, fetch AI recommendations & daily plan
      if (user?.role === 'learner') {
        setLoadingAi(true);
        try {
          const [recRes, planRes] = await Promise.all([
            api.get('/ai/recommendations'),
            api.get('/ai/daily-plan')
          ]);
          if (recRes.data.success) setAiInsights(recRes.data.data);
          if (planRes.data.success) setDailyPlan(planRes.data.data);
        } catch (aiErr) {
          console.error('Error fetching AI dashboard recommendations:', aiErr);
        } finally {
          setLoadingAi(false);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user?.role, user?.preferredLanguage]);

  const handleRefillHearts = async () => {
    try {
      setRefillingHearts(true);
      const res = await api.post('/auth/refill-hearts');
      if (res.data.success) {
        setUser({ ...user, hearts: res.data.hearts });
      }
    } catch (err) {
      console.error('Failed to refill hearts:', err);
    } finally {
      setRefillingHearts(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  if (user.role === 'admin') {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px' }}>
            {translate(lang, 'adminDashboard')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your teaching pathway, view metrics, and monitor student literacy progress.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { label: translate(lang, 'curriculum'), count: stats.curriculaCount, icon: <MenuBookIcon sx={{ fontSize: 35 }} />, color: 'primary.main', path: '/curriculum' },
            { label: translate(lang, 'lessons'), count: stats.lessonsCount, icon: <AutoStoriesIcon sx={{ fontSize: 35 }} />, color: 'secondary.main', path: '/lessons' },
            { label: translate(lang, 'assessments'), count: stats.assessmentsCount, icon: <QuizIcon sx={{ fontSize: 35 }} />, color: 'error.main', path: '/assessment' },
            { label: translate(lang, 'results'), count: stats.resultsCount, icon: <AssignmentIcon sx={{ fontSize: 35 }} />, color: 'warning.main', path: '/results' },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'scale(1.02)' }, transition: 'all 0.2s' }} onClick={() => navigate(item.path)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {item.count}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: item.color, width: 60, height: 60 }}>
                    {item.icon}
                  </Avatar>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 1, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  {translate(lang, 'quickOps')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="primary" onClick={() => navigate('/curriculum')} sx={{ py: 1.5 }}>
                      {translate(lang, 'addCurriculum')}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="secondary" onClick={() => navigate('/lessons')} sx={{ py: 1.5 }}>
                      {translate(lang, 'addLesson')}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button fullWidth variant="outlined" color="error" onClick={() => navigate('/assessment')} sx={{ py: 1.5 }}>
                      {translate(lang, 'addAssessment')}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  {translate(lang, 'viewStudentLogs')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    Review and analyze test submissions across multiple student roles and track performance.
                  </Typography>
                  <Button variant="contained" color="secondary" onClick={() => navigate('/results')} sx={{ alignSelf: 'flex-start' }}>
                    {translate(lang, 'viewStudentLogs')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Results Table */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Recent Submissions Logs
        </Typography>
        <TableContainer component={Paper} sx={{ border: '2px solid #e5e5e5', borderRadius: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quiz / Exam</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Overall Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No assessment attempts recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentResults.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.userId?.name || 'N/A'}</TableCell>
                    <TableCell>{row.assessmentId?.title || 'General Quiz'}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.scores?.overall}%</TableCell>
                    <TableCell>
                      <Chip label={row.proficiency} color={getProficiencyColor(row.proficiency)} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{new Date(row.completedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // ==================== TEACHER DASHBOARD ====================
  if (user.role === 'teacher') {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1.5px' }}>
            {translate(lang, 'teacherDashboard')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your student logs, review lessons, and prepare dynamically generated exercises.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800, mb: 1 }}>
                  Total Lessons Maintained
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {stats.lessonsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800, mb: 1 }}>
                  Total Student Submissions
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                  {stats.resultsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          {translate(lang, 'viewStudentLogs')}
        </Typography>
        <TableContainer component={Paper} sx={{ border: '2px solid #e5e5e5', borderRadius: 4, mb: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Learner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quiz / Exam</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Overall Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No assessment attempts recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentResults.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.userId?.name || 'N/A'}</TableCell>
                    <TableCell>{row.assessmentId?.title || 'General Quiz'}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.scores?.overall}%</TableCell>
                    <TableCell>
                      <Chip label={row.proficiency} color={getProficiencyColor(row.proficiency)} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{new Date(row.completedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Button variant="contained" color="primary" onClick={() => navigate('/lessons')} sx={{ py: 1.2, px: 3 }}>
          Manage Literacy Lessons Database
        </Button>
      </Box>
    );
  }

  // ==================== LEARNER DASHBOARD (DUOLINGO REDESIGN) ====================
  // Calculate level
  const learnerProficiency = recentResults.length > 0 ? recentResults[0].proficiency : 'Beginner';
  const progressPercent = Math.min(100, Math.round(((user.xp || 0) / (user.dailyGoal || 50)) * 100));

  return (
    <Box sx={{ pb: 6 }}>
      {/* 1. Header Gamified Bar */}
      <Card sx={{ mb: 4, borderRadius: 5, border: '2px solid #e5e5e5' }}>
        <CardContent sx={{ py: 2.5, px: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          {/* Welcome Message */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-1px' }}>
              {translate(lang, 'welcome', { name: user.name })}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {translate(lang, 'welcomeSub')}
            </Typography>
          </Box>

          {/* Gamification Stats indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Streak count */}
            <TooltipWrapper title={translate(lang, 'streak')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff5e5', py: 1, px: 2, borderRadius: 3, border: '2px solid #ffd599' }}>
                <LocalFireDepartmentIcon sx={{ color: '#ff9600', fontSize: 30, animation: 'pulse 1.5s infinite' }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#e67300' }}>
                  {user.streak || 0}
                </Typography>
              </Box>
            </TooltipWrapper>

            {/* Hearts indicator */}
            <TooltipWrapper title={translate(lang, 'hearts')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffe5e5', py: 1, px: 2, borderRadius: 3, border: '2px solid #ffb3b3' }}>
                <FavoriteIcon sx={{ color: '#ff4b4b', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#cc0000' }}>
                  {user.hearts}
                </Typography>
                {user.hearts < 5 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    disabled={refillingHearts}
                    onClick={handleRefillHearts}
                    sx={{ ml: 1, py: 0.2, px: 1, fontSize: '0.75rem', borderRadius: 2 }}
                  >
                    {refillingHearts ? <AutorenewIcon className="rotating" /> : '+ Refill'}
                  </Button>
                )}
              </Box>
            </TooltipWrapper>

            {/* XP point count */}
            <TooltipWrapper title={translate(lang, 'xp')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#e5f3ff', py: 1, px: 2, borderRadius: 3, border: '2px solid #99cfff' }}>
                <BoltIcon sx={{ color: '#00b0ff', fontSize: 30 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0081cb' }}>
                  {user.xp || 0}
                </Typography>
              </Box>
            </TooltipWrapper>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Left column: Mascot, recommended items and daily checklist */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Friendly Mascot panel */}
            <Card sx={{ border: '3px solid', borderColor: 'primary.main', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1.5 }}>
                <Chip label={learnerProficiency} color={getProficiencyColor(learnerProficiency)} sx={{ fontWeight: 800 }} />
              </Box>
              <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* SVG Animated Owl Mascot */}
                <Box
                  onClick={() => speak(translate(lang, 'tutorName') + " greets you!", lang)}
                  sx={{
                    width: 90,
                    height: 90,
                    cursor: 'pointer',
                    animation: 'bounce 2.5s infinite',
                    flexShrink: 0
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    {/* Owl Body */}
                    <circle cx="50" cy="50" r="40" fill="#58cc02" />
                    <circle cx="50" cy="50" r="32" fill="#8eff4c" />
                    {/* Eyes */}
                    <circle cx="38" cy="40" r="12" fill="#fff" />
                    <circle cx="38" cy="40" r="6" fill="#000" />
                    <circle cx="62" cy="40" r="12" fill="#fff" />
                    <circle cx="62" cy="40" r="6" fill="#000" />
                    {/* Beak */}
                    <polygon points="50,45 44,53 56,53" fill="#ff9600" />
                    {/* Cheeks */}
                    <circle cx="28" cy="52" r="4" fill="#ff5252" opacity="0.6" />
                    <circle cx="72" cy="52" r="4" fill="#ff5252" opacity="0.6" />
                    {/* Graduation Hat */}
                    <polygon points="50,12 80,22 50,32 20,22" fill="#1ea000" />
                    <rect x="47" y="22" width="6" height="10" fill="#1ea000" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {translate(lang, 'tutorName')} 🦉
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ fontStyle: 'italic', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => speak(aiInsights.summary || "Keep practicing your vocabulary, you are doing great!", lang)}
                  >
                    "{aiInsights.summary || "Keep up the excellent study routine! Choose a path or practice with AI below."}"
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Daily Goal tracking */}
            <Card>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  {translate(lang, 'dailyGoal')}
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress size={120} thickness={6} variant="determinate" value={progressPercent} color="secondary" />
                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justify: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {progressPercent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.xp || 0} / {user.dailyGoal || 50} XP
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Earn {Math.max(0, (user.dailyGoal || 50) - (user.xp || 0))} more XP to complete today's goal!
                </Typography>
              </CardContent>
            </Card>

            {/* AI Daily Planner */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 {translate(lang, 'dailyPlanTitle')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {dailyPlan.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No custom checklist generated yet. Try finishing a lesson first!
                  </Typography>
                ) : (
                  <List>
                    {dailyPlan.map((plan, idx) => (
                      <ListItem key={idx} disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Checkbox checked={plan.completed || false} color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={plan.task}
                          secondary={`+${plan.xpReward} XP`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Tutor Chat Link */}
            <Card sx={{ border: '2px dashed #58cc02', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => navigate('/ai-tutor')}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 50, height: 50 }}>
                  <ChatIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {translate(lang, 'aiTutorChat')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translate(lang, 'aiTutorSubtitle')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right column: Interactive Progress Map and Recommendations */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* AI Recommendations/Insights panel */}
            {aiInsights.weaknesses?.length > 0 && (
              <Card sx={{ bgcolor: 'rgba(255, 150, 0, 0.05)', border: '2px solid #ffd599' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: '#e67300' }}>
                    🎯 {translate(lang, 'recommendationsTitle')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Current Focus Areas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                    {aiInsights.weaknesses.map((w, idx) => (
                      <Chip key={idx} label={w} color="warning" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                    ))}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Next Recommended Lessons:
                  </Typography>
                  <List size="small" sx={{ p: 0 }}>
                    {aiInsights.recommendations.map((rec, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 30, color: '#ff9600' }}>•</ListItemIcon>
                        <ListItemText primary={rec} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Duolingo Progress Map */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, textAlign: 'center' }}>
                🗺️ {translate(lang, 'curriculum')} Roadmap
              </Typography>
              <Divider sx={{ mb: 4 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {allLessons.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    No lessons available in your pathway right now.
                  </Typography>
                ) : (
                  allLessons.map((lesson, idx) => {
                    const isCompleted = user.completedLessons?.some(cl => cl.lessonId === lesson._id);
                    const isUnlocked = idx === 0 || user.unlockedLessons?.includes(lesson._id) || (user.xp || 0) >= (idx * 30) || isCompleted;

                    // Wavy path using sinusoidal offset
                    const offset = Math.sin((idx * Math.PI) / 3) * 60; // 60px wave amplitude

                    return (
                      <Box
                        key={lesson._id}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          my: 2,
                          transform: `translateX(${offset}px)`
                        }}
                      >
                        {/* Connecting line to the next node (except last) */}
                        {idx < allLessons.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 50,
                              height: 64 /* spacing between */,
                              width: 8,
                              bgcolor: isCompleted ? '#4cc9f0' : '#e0e0e0',
                              zIndex: 0,
                              borderRadius: 4
                            }}
                          />
                        )}

                        {/* Node Bubble */}
                        <Box
                          onClick={() => isUnlocked && navigate(`/lessons/${lesson._id}`)}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isUnlocked ? 'pointer' : 'not-allowed',
                            bgcolor: isCompleted ? '#4cc9f0' : (isUnlocked ? '#f72585' : '#e5e5e5'),
                            color: '#fff',
                            boxShadow: isUnlocked ? '0 8px 0px rgba(0,0,0,0.15)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '&:hover': {
                              transform: isUnlocked ? 'translateY(-6px)' : 'none',
                              boxShadow: isUnlocked ? '0 14px 10px rgba(0,0,0,0.1)' : 'none',
                            }
                          }}
                        >
                          {isCompleted ? <CheckCircleIcon sx={{ fontSize: 40 }} /> :
                            (isUnlocked ? <PlayCircleFilledIcon sx={{ fontSize: 48 }} /> : <LockIcon sx={{ fontSize: 32, color: '#9e9e9e' }} />)}
                        </Box>

                        {/* Floating Tooltip Label */}
                        <Box
                          sx={{
                            mt: 2,
                            bgcolor: '#fff',
                            px: 2,
                            py: 0.5,
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #f0f0f0'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                            {idx === allLessons.length - 1 ? '🎯 Boss Challenge' : lesson.title}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* Bounce and Pulse Animation Classes Injection */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1.5s linear infinite;
        }
      `}</style>
    </Box>
  );
};

// Quick helper component to avoid tooltips crashes
const TooltipWrapper = ({ children, title }) => (
  <div title={title}>{children}</div>
);

export default Dashboard;
