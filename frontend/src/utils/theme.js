import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00b0ff', // Vivid light blue (Duolingo style vibe, very clean)
      light: '#69e2ff',
      dark: '#0081cb',
      contrastText: '#fff',
    },
    secondary: {
      main: '#58cc02', // Duolingo green
      light: '#8eff4c',
      dark: '#1ea000',
      contrastText: '#fff',
    },
    warning: {
      main: '#ffc107',
    },
    error: {
      main: '#ff5252',
    },
    background: {
      default: '#f7f8fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#3c3c3c',
      secondary: '#777777',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      color: '#3c3c3c',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      borderRadius: 12,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderBottom: '4px solid rgba(0,0,0,0.2)', // 3D effect button like Duolingo
          transition: 'all 0.1s ease',
          '&:active': {
            transform: 'translateY(2px)',
            borderBottom: '2px solid rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#009ee6',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#4eb402',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          border: '2px solid #e5e5e5',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#3c3c3c',
          boxShadow: 'none',
          borderBottom: '2px solid #e5e5e5',
        },
      },
    },
  },
});

export default theme;
