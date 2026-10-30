import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { AuthContext } from '../context/AuthContext';
import { useAxios } from '../hooks/useAxios';

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi (हिंदी)' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
  { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
];

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const api = useAxios();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    education: user?.education || '',
    nativeLanguage: user?.nativeLanguage || 'English',
    learningLanguage: user?.learningLanguage || 'English',
    reasonForLearning: user?.reasonForLearning || 'Daily Communication',
    experienceLevel: user?.experienceLevel || user?.currentLevel || 'Beginner',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', {
        ...formData,
        age: parseInt(formData.age, 10),
      });

      if (res.data && res.data.success) {
        setUser(res.data.user);
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          User Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage account details, native UI language, and learning language independently.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
              <PersonIcon color="primary" sx={{ fontSize: 35 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered as: <strong>{user.role.toUpperCase()}</strong>
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 4 }} />

          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="education"
                  label="Education Background"
                  value={formData.education}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="native-lang-label">Native Language</InputLabel>
                  <Select
                    labelId="native-lang-label"
                    id="nativeLanguage"
                    name="nativeLanguage"
                    label="Native Language"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    sx={{ borderRadius: 3 }}
                  >
                    {LANGUAGES.map((language) => (
                      <MenuItem key={language.value} value={language.value}>{language.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="learning-lang-label">Learning Language</InputLabel>
                  <Select
                    labelId="learning-lang-label"
                    id="learningLanguage"
                    name="learningLanguage"
                    label="Learning Language"
                    value={formData.learningLanguage}
                    onChange={handleChange}
                    sx={{ borderRadius: 3 }}
                  >
                    {LANGUAGES.map((language) => (
                      <MenuItem key={language.value} value={language.value}>{language.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 4, px: 4, py: 1.2, fontWeight: 700 }}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
