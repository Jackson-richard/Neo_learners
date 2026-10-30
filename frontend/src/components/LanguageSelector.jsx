import React, { useContext } from 'react';
import { FormControl, Select, MenuItem, InputLabel, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSelector = ({ size = 'small', showLabel = false }) => {
  const { user, updateLanguages } = useContext(AuthContext);

  const handleChange = (event) => {
    updateLanguages(event.target.value, user.learningLanguage || 'English');
  };

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon color="primary" />
      <FormControl size={size} sx={{ minWidth: 120 }}>
        {showLabel && <InputLabel id="lang-select-label">Language</InputLabel>}
        <Select
          labelId="lang-select-label"
          id="lang-select"
          value={user.nativeLanguage || 'English'}
          label={showLabel ? 'Language' : undefined}
          onChange={handleChange}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            border: '2px solid #e5e5e5',
            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
            bgcolor: 'background.paper',
          }}
        >
          <MenuItem value="English">English</MenuItem>
          <MenuItem value="Hindi">Hindi (हिंदी)</MenuItem>
          <MenuItem value="Tamil">Tamil (தமிழ்)</MenuItem>
          <MenuItem value="Telugu">Telugu (తెలుగు)</MenuItem>
          <MenuItem value="Kannada">Kannada (ಕನ್ನಡ)</MenuItem>
          <MenuItem value="Malayalam">Malayalam (മലയാളം)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
