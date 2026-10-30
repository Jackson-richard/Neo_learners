import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  LinearProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useAxios } from '../hooks/useAxios';
import { translate } from '../utils/i18n';

const LessonReader = () => {
  const { id } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const { speak, getSpeechRecognizer } = useContext(AccessibilityContext);
  const api = useAxios();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);

  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Interaction states for the current step
  const [selectedOption, setSelectedOption] = useState('');
  const [stepStatus, setStepStatus] = useState('idle'); // idle, correct, incorrect, completed

  // Voice feature states
  const [listening, setListening] = useState(false);
  const [userSpeechResult, setUserSpeechResult] = useState('');
  const recognitionRef = useRef(null);

  const uiLang = user?.nativeLanguage || 'English';
  const learningLang = user?.learningLanguage || 'English';

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/lessons/${id}`);
        const data = res.data.data;
        setLesson(data);

        // Build Duolingo-style game sequence
        const sequence = [];

        // 1. New Word Introductions & Voice practice (if vocabulary exists)
        if (data.vocabulary && data.vocabulary.length > 0) {
          data.vocabulary.forEach(v => {
            sequence.push({ type: 'learn_word', data: v });
            sequence.push({ type: 'speak_word', data: v });
          });
        }

        // 2. Exercises sequence
        if (data.exercises && data.exercises.length > 0) {
          data.exercises.forEach(ex => {
            sequence.push({ type: 'exercise', data: ex });
          });
        }

        // 3. Outro summary
        sequence.push({ type: 'outro', data: { title: data.title } });

        if (sequence.length === 1) { // Only outro? fallback if no content
          sequence.unshift({ type: 'fallback_read', data: data });
        }

        setSteps(sequence);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLessonDetails();
    }
  }, [id, api, user, learningLang]);

  const currentStep = steps[currentStepIndex];

  // Setup Voice Recognition 
  useEffect(() => {
    if (currentStep?.type === 'speak_word') {
      const recognizer = getSpeechRecognizer(learningLang);
      if (recognizer) {
        recognizer.onstart = () => {
          setListening(true);
          setUserSpeechResult('');
          setStepStatus('idle');
        };
        recognizer.onend = () => setListening(false);
        recognizer.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim();
          setUserSpeechResult(transcript);

          const targetClean = currentStep.data.word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
          const speechClean = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();

          let score = 0;
          if (targetClean === speechClean) {
            score = 100;
          } else {
            const targetWords = targetClean.split(' ');
            const speechWords = speechClean.split(' ');
            const matched = targetWords.filter(w => speechWords.includes(w)).length;
            score = Math.round((matched / Math.max(targetWords.length, 1)) * 100);
          }

          if (score >= 70) {
            setStepStatus('correct');
          } else {
            setStepStatus('incorrect');
          }
        };
        recognitionRef.current = recognizer;
      }
    }
  }, [currentStepIndex, currentStep, learningLang, getSpeechRecognizer]);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert('Voice check is not supported in this browser. Try Chrome/Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption.trim().toLowerCase() === currentStep.data.correctAnswer.trim().toLowerCase();
    setStepStatus(isCorrect ? 'correct' : 'incorrect');
  };

  const handleNextStep = () => {
    // Reset states for next screen
    setSelectedOption('');
    setStepStatus('idle');
    setUserSpeechResult('');
    setListening(false);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished lesson, grant XP and go home
      finishLesson();
    }
  };

  const finishLesson = async () => {
    try {
      // Optional: Post to backend to record completion
      // await api.post('/results', { lessonId: lesson._id });
      // Update local context XP mock
      if (setUser && user) {
        setUser({ ...user, xp: (user.xp || 0) + 15, streak: (user.streak || 0) + 1 });
      }
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    }
  };

  const getFooter = () => {
    if (currentStep?.type === 'outro') {
      return (
        <Box sx={{ p: 3, borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleNextStep} sx={{ width: '100%', maxWidth: 400, py: 1.5, fontSize: '1.2rem', fontWeight: 900, borderRadius: 4 }}>
            {translate(uiLang, 'continue') || 'CONTINUE'}
          </Button>
        </Box>
      );
    }

    if (currentStep?.type === 'learn_word' || currentStep?.type === 'fallback_read') {
      return (
        <Box sx={{ p: 3, borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" onClick={handleNextStep} sx={{ width: '100%', maxWidth: 400, py: 1.5, fontSize: '1.2rem', fontWeight: 900, borderRadius: 4 }}>
            {translate(uiLang, 'continue') || 'CONTINUE'}
          </Button>
        </Box>
      );
    }

    // Exercise or Speak types require checking
    if (stepStatus === 'idle') {
      const isDisabled = currentStep?.type === 'exercise' && !selectedOption;
      return (
        <Box sx={{ p: 3, borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={isDisabled || (currentStep?.type === 'speak_word')}
            onClick={handleCheckAnswer}
            sx={{ width: '100%', maxWidth: 400, py: 1.5, fontSize: '1.2rem', fontWeight: 900, borderRadius: 4 }}
          >
            {currentStep?.type === 'speak_word' ? translate(uiLang, 'useMicToCheck') : (translate(uiLang, 'checkAnswer') || 'CHECK')}
          </Button>
        </Box>
      );
    }

    if (stepStatus === 'correct') {
      return (
        <Box sx={{ p: 3, bgcolor: '#d7ffb8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#58a700' }}>
            <CheckCircleIcon sx={{ fontSize: 40 }} />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Correct! Excellent.</Typography>
          </Box>
          <Button variant="contained" sx={{ bgcolor: '#58cc02', color: '#fff', py: 1.5, px: 4, fontWeight: 900, fontSize: '1.1rem', borderRadius: 4 }} onClick={handleNextStep}>
            {translate(uiLang, 'continue') || 'CONTINUE'}
          </Button>
        </Box>
      );
    }

    if (stepStatus === 'incorrect') {
      return (
        <Box sx={{ p: 3, bgcolor: '#ffdfe0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#ea2b2b' }}>
            <CancelIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{translate(uiLang, 'incorrect')}</Typography>
              {currentStep.data.correctAnswer && <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{translate(uiLang, 'correctAnswer')}: {currentStep.data.correctAnswer}</Typography>}
            </Box>
          </Box>
          <Button variant="contained" sx={{ bgcolor: '#ff4b4b', color: '#fff', py: 1.5, px: 4, fontWeight: 900, fontSize: '1.1rem', borderRadius: 4 }} onClick={() => setStepStatus('idle')}>
            {translate(uiLang, 'tryAgain')}
          </Button>
        </Box>
      );
    }
  };

  if (loading || steps.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const progress = Math.max(5, (currentStepIndex / steps.length) * 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>

      {/* Target top Progress Bar (Duolingo Style header) */}
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="large" />
        </IconButton>
        <Box sx={{ flexGrow: 1, height: 16, bgcolor: '#e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', bgcolor: '#58cc02', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: 8 }} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 4 }, py: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 700 }}>

          {/* Type: Learn Word */}
          {currentStep.type === 'learn_word' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: 'text.primary' }}>
                {translate(uiLang, 'newWord')}
              </Typography>
              <Card sx={{ border: '2px solid #e5e5e5', borderRadius: 6, boxShadow: '0 4px 0 rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <Typography variant="h1" sx={{ color: 'secondary.main', fontWeight: 900 }}>
                    {currentStep.data.word}
                  </Typography>
                  <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {currentStep.data.translation}
                  </Typography>
                  {currentStep.data.pronunciation && (
                    <Typography variant="h6" color="primary" sx={{ fontStyle: 'italic' }}>
                      ({currentStep.data.pronunciation})
                    </Typography>
                  )}
                  <IconButton
                    onClick={() => speak(currentStep.data.word, learningLang)}
                    sx={{ bgcolor: 'rgba(28,176,246,0.1)', color: '#1cb0f6', width: 64, height: 64, mt: 2, '&:hover': { bgcolor: 'rgba(28,176,246,0.2)' } }}
                  >
                    <VolumeUpIcon sx={{ fontSize: 36 }} />
                  </IconButton>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Type: Speak Word */}
          {currentStep.type === 'speak_word' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                {translate(uiLang, 'speakThisAloud')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={() => speak(currentStep.data.word, learningLang)} sx={{ bgcolor: '#1cb0f6', color: '#fff' }}>
                  <VolumeUpIcon />
                </IconButton>
                <Typography variant="h3" sx={{ fontWeight: 900, textDecoration: 'underline', textDecorationColor: '#e5e5e5' }}>
                  {currentStep.data.word}
                </Typography>
              </Box>

              <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleToggleMic}
                  sx={{
                    bgcolor: listening ? '#ff4b4b' : '#fff',
                    color: listening ? '#fff' : '#1cb0f6',
                    border: listening ? 'none' : '2px solid #1cb0f6',
                    width: 100, height: 100, borderRadius: '50%',
                    mb: 4
                  }}
                >
                  {listening ? <MicOffIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
                </Button>
                {userSpeechResult && (
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {translate(uiLang, 'youSaid')}: "{userSpeechResult}"
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Type: Exercise (Multiple Choice) */}
          {currentStep.type === 'exercise' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                {currentStep.data.question}
                <IconButton onClick={() => speak(currentStep.data.question, uiLang)} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                  <VolumeUpIcon fontSize="small" />
                </IconButton>
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                  <Grid container spacing={2}>
                    {currentStep.data.options.map((opt, optIdx) => (
                      <Grid item xs={12} sm={6} key={optIdx}>
                        <Paper
                          onClick={() => stepStatus === 'idle' && setSelectedOption(opt)}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: selectedOption === opt ? '#1cb0f6' : '#e5e5e5',
                            bgcolor: selectedOption === opt ? '#e5f3ff' : 'transparent',
                            boxShadow: selectedOption === opt ? 'none' : '0 4px 0 rgba(0,0,0,0.05)',
                            transform: selectedOption === opt ? 'translateY(2px)' : 'none',
                            '&:hover': { borderColor: '#1cb0f6' },
                            transition: 'all 0.1s'
                          }}
                        >
                          <FormControlLabel
                            value={opt}
                            control={<Radio sx={{ display: 'none' }} />}
                            label={<Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: selectedOption === opt ? '#1cb0f6' : 'text.primary' }}>{opt}</Typography>}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Type: Outro */}
          {currentStep.type === 'outro' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ animation: 'bounce 2s infinite', mb: 4 }}>
                <EmojiEventsIcon sx={{ fontSize: 120, color: '#ffc800' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffc800', mb: 2 }}>
                {translate(uiLang, 'lessonComplete')}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700, mb: 4 }}>
                {translate(uiLang, 'earnedXp', { xp: 15 })}
              </Typography>
            </Box>
          )}

          {/* Type: Fallback Read */}
          {currentStep.type === 'fallback_read' && (
            <Box>
              <Typography variant="body1">
                {translate(uiLang, 'lessonPreviewFallback')}
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      {/* Footer / Checking Box */}
      {getFooter()}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </Box>
  );
};

export default LessonReader;
