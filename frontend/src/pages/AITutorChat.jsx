import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { useAxios } from '../hooks/useAxios';
import { translate } from '../utils/i18n';

const AITutorChat = () => {
  const { user } = useContext(AuthContext);
  const { speak, getSpeechRecognizer } = useContext(AccessibilityContext);
  const api = useAxios();
  const navigate = useNavigate();

  const lang = user?.nativeLanguage || 'English';

  const [messages, setMessages] = useState([
    {
      sender: 'tutor',
      text: translate(lang, 'welcomeSub'),
      time: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initializing Speech Recognition for user queries
  useEffect(() => {
    const recognizer = getSpeechRecognizer(lang);
    if (recognizer) {
      recognizer.onstart = () => setListening(true);
      recognizer.onend = () => setListening(false);
      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev + ' ' + transcript).trim());
      };
      recognitionRef.current = recognizer;
    }
  }, [lang]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech input is not supported in this browser configuration.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    setErrorMsg('');
    const userMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSending(true);

    try {
      // Map history format for backend
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: textToSend,
        history: historyPayload
      });

      if (res.data.success) {
        const replyText = res.data.reply;
        const tutorMessage = {
          sender: 'tutor',
          text: replyText,
          time: new Date(),
        };
        setMessages((prev) => [...prev, tutorMessage]);

        // Auto read aloud responses for older adult accessibility
        speak(replyText, lang);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Tutor was unable to respond. Please check connection.');
    } finally {
      setSending(false);
    }
  };

  // Pre-configured localized suggestion chips
  const getSuggestions = () => {
    const suggestionsMap = {
      Tamil: [
        'எழுத்துக்களை எப்படி எழுதுவது?',
        'அம்மா வார்த்தையை உச்சரிக்கவும்',
        'எளிய வாக்கியம் உருவாக்குதல்',
        'இலக்கண விதிமுறைகள் சொல்'
      ],
      Hindi: [
        'वर्णमाला कैसे लिखें?',
        'आम शब्द का उच्चारण सुनाएं',
        'सरल वाक्य कैसे बनाएं?',
        'हिंदी व्याकरण के नियम'
      ],
      Telugu: [
        'అక్షరాలు ఎలా రాయాలి?',
        'అమ్మ పదాన్ని పలకండి',
        'సరళ వాక్యం ఎలా రాయాలి?',
        'తెలుగు వ్యాకరణం నియమాలు'
      ],
      English: [
        'How do I write uppercase letters?',
        'Pronounce the word "Apple" for me',
        'Explain basic sentence grammar',
        'Show me daily practice words'
      ]
    };
    return suggestionsMap[lang] || suggestionsMap['English'];
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', pb: 4 }}>
      {/* Header toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          {translate(lang, 'goBack')}
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
          🦉 {translate(lang, 'tutorName')}
        </Typography>
      </Box>

      {/* Main chat window container */}
      <Card sx={{ border: '2px solid #e5e5e5', height: '65vh', display: 'flex', flexDirection: 'column', borderRadius: 5 }}>
        {/* Messages body scrolling */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#fafafa' }}>
          {messages.map((m, idx) => {
            const isTutor = m.sender === 'tutor';
            return (
              <Box key={idx} sx={{ display: 'flex', justifyContent: isTutor ? 'flex-start' : 'flex-end', alignItems: 'flex-start', gap: 2 }}>
                {isTutor && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                    🦉
                  </Avatar>
                )}
                <Box sx={{ maxWidth: '75%', position: 'relative' }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: isTutor ? '0 18px 18px 18px' : '18px 0 18px 18px',
                      bgcolor: isTutor ? '#ffffff' : 'primary.main',
                      color: isTutor ? 'text.primary' : 'primary.contrastText',
                      border: '2px solid',
                      borderColor: isTutor ? '#e5e5e5' : 'primary.main',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.6, fontSize: '1.1rem' }}>
                      {m.text}
                    </Typography>
                  </Paper>

                  {isTutor && (
                    <IconButton
                      size="small"
                      onClick={() => speak(m.text, lang)}
                      sx={{ position: 'absolute', right: -42, top: 8, bgcolor: 'background.paper', border: '1px solid #e5e5e5' }}
                      title={translate(lang, 'ttsReadAloud')}
                    >
                      <VolumeUpIcon fontSize="small" color="primary" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
          {sending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 8 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Gyan is typing...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Suggestion Chips Panel */}
        <Box sx={{ px: 3, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, bgcolor: '#fff' }}>
          {getSuggestions().map((s, idx) => (
            <Chip
              key={idx}
              label={s}
              onClick={() => handleSend(s)}
              clickable
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: 3, py: 2 }}
            />
          ))}
        </Box>

        <Divider />

        {/* Input Text Box with Audio toggles */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <IconButton
            color={listening ? 'error' : 'secondary'}
            onClick={handleToggleListening}
            sx={{ border: '2px solid', borderColor: listening ? 'error.main' : 'secondary.main', p: 1.5 }}
            title={listening ? 'Stop listening' : translate(lang, 'speakButton')}
          >
            {listening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>

          <TextField
            fullWidth
            placeholder={listening ? translate(lang, 'listening') : translate(lang, 'askTutorPlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={listening}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '1.05rem'
              }
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || sending}
            sx={{ p: 1.8, minWidth: 60, borderRadius: 4 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Card>
      {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}
    </Box>
  );
};

export default AITutorChat;
