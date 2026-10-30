import React, { useContext } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { translate } from '../utils/i18n';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const currentLang = user.nativeLanguage || 'English';

  const adminMenu = [
    { text: translate(currentLang, 'adminDashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: translate(currentLang, 'curriculum'), icon: <MenuBookIcon />, path: '/curriculum' },
    { text: translate(currentLang, 'lessons'), icon: <AutoStoriesIcon />, path: '/lessons' },
    { text: translate(currentLang, 'assessments'), icon: <QuizIcon />, path: '/assessment' },
    { text: translate(currentLang, 'viewStudentLogs'), icon: <AssignmentTurnedInIcon />, path: '/results' },
    { text: translate(currentLang, 'profile'), icon: <PersonIcon />, path: '/profile' },
  ];

  const teacherMenu = [
    { text: translate(currentLang, 'teacherDashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: translate(currentLang, 'lessons'), icon: <AutoStoriesIcon />, path: '/lessons' },
    { text: translate(currentLang, 'assessments'), icon: <QuizIcon />, path: '/assessment' },
    { text: translate(currentLang, 'viewStudentLogs'), icon: <AssignmentTurnedInIcon />, path: '/results' },
    { text: translate(currentLang, 'profile'), icon: <PersonIcon />, path: '/profile' },
  ];

  const learnerMenu = [
    { text: 'Learn', icon: <MenuBookIcon />, path: '/dashboard' },
    { text: translate(currentLang, 'profile'), icon: <PersonIcon />, path: '/profile' },
  ];

  const getMenuItems = () => {
    if (user.role === 'admin') return adminMenu;
    if (user.role === 'teacher') return teacherMenu;
    return learnerMenu;
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box>
      <Toolbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {translate(currentLang, 'menu')}
        </Typography>
      </Box>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 2,
                  backgroundColor: isSelected ? 'primary.main' : 'transparent',
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isSelected ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  },
                  transition: 'all 0.1s ease',
                  borderBottom: isSelected ? '3px solid rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? 'primary.contrastText' : 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 600,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '2px solid #e5e5e5',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '2px solid #e5e5e5',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { drawerWidth };
