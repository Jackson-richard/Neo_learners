import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
  Button,
  ButtonGroup,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import ContrastIcon from '@mui/icons-material/Contrast';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { translate } from '../utils/i18n';
import LanguageSelector from './LanguageSelector';

const Navbar = ({ onDrawerToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const { fontSize, setFontSize, highContrast, toggleHighContrast } = useContext(AccessibilityContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const currentLang = user?.nativeLanguage || 'English';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontWeight: 900,
              letterSpacing: '-1px',
              cursor: 'pointer',
              color: 'text.primary'
            }}
            onClick={() => navigate('/dashboard')}
          >
            NeoLiteracy
          </Typography>
          {user && (
            <Chip
              label={
                user.role === 'admin'
                  ? translate(currentLang, 'adminDashboard')
                  : user.role === 'teacher'
                    ? translate(currentLang, 'teacherDashboard')
                    : translate(currentLang, 'dashboard')
              }
              color={user.role === 'admin' ? 'warning' : user.role === 'teacher' ? 'primary' : 'secondary'}
              size="medium"
              sx={{ ml: 2, fontWeight: 800, borderRadius: 2 }}
            />
          )}
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
            {/* Show Duolingo Style Stats for learners */}
            {user.role === 'learner' && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', fontWeight: 900 }}>
                  <FavoriteIcon sx={{ mr: 0.5 }} /> {user.hearts || 5}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main', fontWeight: 900 }}>
                  <LocalFireDepartmentIcon sx={{ mr: 0.5 }} /> {user.streak || 0}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main', fontWeight: 900 }}>
                  <BoltIcon sx={{ mr: 0.5 }} /> {user.xp || 0} XP
                </Box>
                <LanguageSelector />
              </Box>
            )}

            {/* Show Language selector for learners (Mobile fallback if needed) */}
            {user.role === 'learner' && (
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <LanguageSelector />
              </Box>
            )}

            {/* Quick Access Accessibility Controls directly in Toolbar */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleHighContrast} color="inherit" title={translate(currentLang, 'highContrastTitle')}>
                <ContrastIcon color={highContrast ? 'secondary' : 'action'} />
              </IconButton>
              <ButtonGroup size="small" variant="outlined" color="primary">
                <Button
                  onClick={() => setFontSize('normal')}
                  variant={fontSize === 'normal' ? 'contained' : 'outlined'}
                  sx={{ fontWeight: 800 }}
                >
                  A
                </Button>
                <Button
                  onClick={() => setFontSize('large')}
                  variant={fontSize === 'large' ? 'contained' : 'outlined'}
                  sx={{ fontWeight: 800, fontSize: '1.1rem' }}
                >
                  A+
                </Button>
                <Button
                  onClick={() => setFontSize('extra-large')}
                  variant={fontSize === 'extra-large' ? 'contained' : 'outlined'}
                  sx={{ fontWeight: 800, fontSize: '1.25rem' }}
                >
                  A++
                </Button>
              </ButtonGroup>
            </Box>

            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ bgcolor: 'secondary.main', width: 42, height: 42, border: '2px solid #fff', fontWeight: 800 }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={undefined}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 10px rgba(0,0,0,0.15))',
                  mt: 1.5,
                  borderRadius: 4,
                  border: '2px solid #e5e5e5',
                  p: 1.5,
                  minWidth: 260,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />

              {/* Mobile Accessibility Settings (Render in Menu) */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  {translate(currentLang, 'accessibilityPanel')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {translate(currentLang, 'highContrastTitle')}
                  </Typography>
                  <IconButton onClick={toggleHighContrast} size="small">
                    <ContrastIcon color={highContrast ? 'secondary' : 'action'} />
                  </IconButton>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    {translate(currentLang, 'fontSizeTitle')}
                  </Typography>
                  <ButtonGroup size="small" fullWidth variant="outlined" color="primary">
                    <Button onClick={() => setFontSize('normal')} variant={fontSize === 'normal' ? 'contained' : 'outlined'}>A</Button>
                    <Button onClick={() => setFontSize('large')} variant={fontSize === 'large' ? 'contained' : 'outlined'}>A+</Button>
                    <Button onClick={() => setFontSize('extra-large')} variant={fontSize === 'extra-large' ? 'contained' : 'outlined'}>A++</Button>
                  </ButtonGroup>
                </Box>
                <Divider sx={{ my: 1.5 }} />
              </Box>

              <MenuItem onClick={handleProfileClick} sx={{ fontWeight: 700, borderRadius: 3, py: 1.2 }}>
                <AccountCircleIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                {translate(currentLang, 'profile')}
              </MenuItem>
              <MenuItem onClick={handleLogoutClick} sx={{ fontWeight: 700, borderRadius: 3, py: 1.2, color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1.5, color: 'error.main' }} />
                {translate(currentLang, 'logout')}
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
