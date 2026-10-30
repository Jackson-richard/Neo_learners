import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Link,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  LinearProgress,
  Checkbox,
  FormGroup,
  Chip,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HearingIcon from '@mui/icons-material/Hearing';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Hindi', label: 'Hindi (हिंदी)' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
  { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
];

const LEARNING_GOALS = [
  'Literacy',
  'School',
  'Career',
  'Travel',
  'Personal Development',
];

const MANUAL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const PLACEMENT_QUESTIONS = {
  Beginner: [
    { id: 'reading', skill: 'reading', prompt: 'Choose the word that is easiest to read.', options: ['Sun', 'Quickly', 'Conversation'], answer: 'Sun' },
    { id: 'vocabulary', skill: 'vocabulary', prompt: 'Which word names a family member?', options: ['Mother', 'Table', 'Blue'], answer: 'Mother' },
    { id: 'grammar', skill: 'grammar', prompt: 'Complete: I ___ water.', options: ['drink', 'drinks', 'drinking'], answer: 'drink' },
  ],
  Intermediate: [
    { id: 'comprehension', skill: 'comprehension', prompt: 'Asha bought rice because her family was cooking dinner. Why did she buy rice?', options: ['For dinner', 'For travel', 'For school'], answer: 'For dinner' },
    { id: 'writing', skill: 'writing', prompt: 'Choose the best sentence.', options: ['She goes to school.', 'She go school.', 'School she going.'], answer: 'She goes to school.' },
    { id: 'listening', skill: 'listening', prompt: 'If you hear "Good morning", when is it commonly used?', options: ['Morning', 'Night', 'During sleep'], answer: 'Morning' },
  ],
  Advanced: [
    { id: 'sentence', skill: 'grammar', prompt: 'Choose the most formal sentence.', options: ['Could you please assist me?', 'Help me now.', 'You help?'], answer: 'Could you please assist me?' },
    { id: 'writing_advanced', skill: 'writing', prompt: 'Which phrase fits a career conversation?', options: ['I would like to apply for this role.', 'I eat rice.', 'This is a red pen.'], answer: 'I would like to apply for this role.' },
    { id: 'speaking', skill: 'speaking', prompt: 'Which response continues a polite conversation?', options: ['Thank you for explaining.', 'Blue table runs.', 'No words.'], answer: 'Thank you for explaining.' },
  ],
};

const initialScores = {
  reading: 0,
  writing: 0,
  listening: 0,
  speaking: 0,
  vocabulary: 0,
  grammar: 0,
  comprehension: 0,
};

const Register = () => {
  const { register, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    education: '',
    nativeLanguage: 'Tamil',
    learningLanguage: 'English',
    role: 'learner',
    reasonForLearning: 'Literacy',
    experienceLevel: 'Beginner',
    placementPreference: 'manual',
    accessibility: {
      largeText: false,
      voiceGuidance: false,
      highContrast: false,
      slowReadingMode: false,
    },
  });

  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      navigate('/dashboard');
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccessibilityChange = (name) => (e) => {
    setFormData({
      ...formData,
      accessibility: {
        ...formData.accessibility,
        [name]: e.target.checked,
      },
    });
  };

  const placementQuestions = Object.values(PLACEMENT_QUESTIONS).flat();

  const calculatePlacement = () => {
    if (formData.placementPreference === 'manual') {
      const scoreByLevel = { Beginner: 20, Intermediate: 60, Advanced: 85 };
      const score = scoreByLevel[formData.experienceLevel] || 20;
      return {
        score,
        level: formData.experienceLevel,
        placementResults: {
          ...initialScores,
          overall: score,
          assignedLevel: formData.experienceLevel,
          completedAt: new Date().toISOString(),
        },
      };
    }

    const skillScores = { ...initialScores };
    let correctCount = 0;

    placementQuestions.forEach((question) => {
      const isCorrect = assessmentAnswers[question.id] === question.answer;
      if (isCorrect) {
        correctCount += 1;
        skillScores[question.skill] = Math.min(100, (skillScores[question.skill] || 0) + 35);
      }
    });

    const overall = Math.round((correctCount / placementQuestions.length) * 100);
    let level = 'Beginner';
    if (overall >= 72) level = 'Advanced';
    else if (overall >= 40) level = 'Intermediate';

    return {
      score: overall,
      level,
      placementResults: {
        ...skillScores,
        overall,
        assignedLevel: level,
        completedAt: new Date().toISOString(),
      },
    };
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      setError('Please fill your account details.');
      return;
    }
    if (step === 2 && (!formData.age || !formData.education)) {
      setError('Please add your age and education background.');
      return;
    }
    if (step === 3 && formData.nativeLanguage === formData.learningLanguage) {
      setError('Choose different languages so instructions and learning content stay separate.');
      return;
    }
    if (step === 4 && !formData.reasonForLearning) {
      setError('Choose a learning goal.');
      return;
    }
    if (step === 5 && formData.placementPreference === 'manual' && !formData.experienceLevel) {
      setError('Choose a starting level or let AI determine it.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.placementPreference === 'ai') {
      const missingAnswer = placementQuestions.some((question) => !assessmentAnswers[question.id]);
      if (missingAnswer) {
        setError('Please complete the placement test before starting.');
        return;
      }
    }

    setLoading(true);
    const { score, level, placementResults } = calculatePlacement();

    const finalData = {
      ...formData,
      age: parseInt(formData.age, 10),
      proficiencyScore: score,
      proficiencyLevel: level,
      currentLevel: level,
      experienceLevel: formData.placementPreference === 'ai' ? 'AI Placement' : formData.experienceLevel,
      placementResults,
    };

    const res = await register(finalData);
    setLoading(false);

    if (res && res.success) {
      navigate('/dashboard');
    } else {
      setError(res?.message || 'Registration failed. Please check the form and try again.');
    }
  };

  const renderLanguageSelect = (name, label) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select name={name} label={label} value={formData[name]} onChange={handleChange}>
        {LANGUAGES.map((language) => (
          <MenuItem key={language.value} value={language.value}>
            {language.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderStep1 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Create Account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Start with a secure learner profile.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField required fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField required fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField required fullWidth label="Password (min 6 chars)" type="password" name="password" value={formData.password} onChange={handleChange} />
        </Grid>
      </Grid>
      <Button fullWidth variant="contained" onClick={handleNextStep} sx={{ mt: 4, py: 1.5 }}>Continue</Button>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link component={RouterLink} to="/login" sx={{ fontWeight: 700 }}>Sign In</Link>
        </Typography>
      </Box>
    </>
  );

  const renderStep2 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Learner Background</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>This helps tune lesson pace and accessibility.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField required fullWidth type="number" label="Age" name="age" value={formData.age} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField required fullWidth label="Education Background" name="education" placeholder="e.g. Primary school" value={formData.education} onChange={handleChange} />
        </Grid>
      </Grid>
      <Button fullWidth variant="contained" onClick={handleNextStep} sx={{ mt: 4, py: 1.5 }}>Choose Languages</Button>
    </>
  );

  const renderStep3 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Choose Languages</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Native language controls the app and explanations. Learning language controls lessons and practice.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {renderLanguageSelect('nativeLanguage', 'Native Language')}
        </Grid>
        <Grid item xs={12} sm={6}>
          {renderLanguageSelect('learningLanguage', 'Learning Language')}
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f7fbff', border: '1px solid #d6ebff', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Example: {formData.nativeLanguage} instructions, {formData.learningLanguage} lessons.
        </Typography>
      </Box>
      <Button fullWidth variant="contained" onClick={handleNextStep} sx={{ mt: 4, py: 1.5 }}>Set Goal</Button>
    </>
  );

  const renderStep4 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Learning Goal</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Choose the journey NeoLiteracy should optimize for.</Typography>
      <Grid container spacing={1.5}>
        {LEARNING_GOALS.map((goal) => (
          <Grid item xs={12} sm={6} key={goal}>
            <Button
              fullWidth
              variant={formData.reasonForLearning === goal ? 'contained' : 'outlined'}
              onClick={() => setFormData({ ...formData, reasonForLearning: goal })}
              sx={{ minHeight: 56, justifyContent: 'flex-start', px: 2, fontWeight: 800 }}
            >
              {goal}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Button fullWidth variant="contained" onClick={handleNextStep} sx={{ mt: 4, py: 1.5 }}>Choose Starting Level</Button>
    </>
  );

  const renderStep5 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Starting Level</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Pick a level or let the placement test decide.</Typography>
      <RadioGroup
        value={formData.placementPreference === 'ai' ? 'AI Placement' : formData.experienceLevel}
        onChange={(e) => {
          const value = e.target.value;
          setFormData({
            ...formData,
            placementPreference: value === 'AI Placement' ? 'ai' : 'manual',
            experienceLevel: value === 'AI Placement' ? 'Beginner' : value,
          });
        }}
      >
        {MANUAL_LEVELS.map((level) => (
          <FormControlLabel key={level} value={level} control={<Radio />} label={level} />
        ))}
        <FormControlLabel
          value="AI Placement"
          control={<Radio />}
          label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AutoAwesomeIcon fontSize="small" /> Let AI Determine My Level</Box>}
        />
      </RadioGroup>
      <Button fullWidth variant="contained" onClick={handleNextStep} sx={{ mt: 4, py: 1.5 }}>
        Accessibility Options
      </Button>
    </>
  );

  const renderStep6 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>Accessibility Options</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Make the journey easier to read, hear, and navigate.</Typography>
      <FormGroup>
        <FormControlLabel control={<Checkbox checked={formData.accessibility.largeText} onChange={handleAccessibilityChange('largeText')} />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><VisibilityIcon fontSize="small" /> Large Text</Box>} />
        <FormControlLabel control={<Checkbox checked={formData.accessibility.voiceGuidance} onChange={handleAccessibilityChange('voiceGuidance')} />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><RecordVoiceOverIcon fontSize="small" /> Voice Guidance</Box>} />
        <FormControlLabel control={<Checkbox checked={formData.accessibility.highContrast} onChange={handleAccessibilityChange('highContrast')} />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><VisibilityIcon fontSize="small" /> High Contrast</Box>} />
        <FormControlLabel control={<Checkbox checked={formData.accessibility.slowReadingMode} onChange={handleAccessibilityChange('slowReadingMode')} />} label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><HearingIcon fontSize="small" /> Slow Reading Mode</Box>} />
      </FormGroup>
      <Button fullWidth variant="contained" color="secondary" onClick={formData.placementPreference === 'ai' ? handleNextStep : handleSubmit} disabled={loading} sx={{ mt: 4, py: 1.5 }}>
        {formData.placementPreference === 'ai' ? 'Start Placement Test' : loading ? 'Creating Journey...' : 'Start Learning Journey'}
      </Button>
    </>
  );

  const renderStep7 = () => (
    <>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>AI Placement Test</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Short adaptive check for reading, writing, listening, speaking, vocabulary, grammar, and comprehension.
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {Object.entries(PLACEMENT_QUESTIONS).map(([level, questions]) => (
        <Box key={level} sx={{ mb: 3 }}>
          <Chip label={level} size="small" sx={{ mb: 1, fontWeight: 800 }} />
          {questions.map((question, index) => (
            <Box key={question.id} sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                {index + 1}. {question.prompt}
              </Typography>
              <RadioGroup value={assessmentAnswers[question.id] || ''} onChange={(e) => setAssessmentAnswers({ ...assessmentAnswers, [question.id]: e.target.value })}>
                {question.options.map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </Box>
          ))}
        </Box>
      ))}
      <Button fullWidth variant="contained" color="secondary" onClick={handleSubmit} disabled={loading} sx={{ mt: 2, py: 1.5 }}>
        {loading ? 'Analyzing...' : 'Finish and View My Path'}
      </Button>
    </>
  );

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box sx={{ my: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 42 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
            NeoLiteracy
          </Typography>
        </Box>

        <Card sx={{ width: '100%', p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Box sx={{ width: '100%', mb: 4 }}>
              <LinearProgress variant="determinate" value={(step / (formData.placementPreference === 'ai' ? 7 : 6)) * 100} sx={{ height: 10, borderRadius: 5 }} />
            </Box>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
            {step === 7 && renderStep7()}
            {step > 1 && (
              <Button fullWidth variant="text" onClick={() => setStep(step - 1)} sx={{ mt: 2 }}>
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
