import { PaletteMode } from '@mui/material';


const getCommonThemes = (mode: PaletteMode) => ({
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  palette: {
    mode,
    primary: {
      main: '#0ACE82',
      light: mode === 'light' ? '#f0fdf4' : '#1b4332',
      dark: mode === 'light' ? '#08a568' : '#078b63',
    },
    secondary: {
      light: mode === 'light' ? '#7EE3D0' : '#4DBB9C',
      main: '#10C998',
      dark: mode === 'light' ? '#0BA978' : '#08845B',
    },
    error: {
      main: '#ff4605',
      light: mode === 'light' ? '#ff8f68' : '#ff6a3a',
      dark: mode === 'light' ? '#cd3804' : '#b33900',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      light: mode === 'light' ? '#f5f5f5' : '#121212',
    },
  },
  spacing: (factor: number) => `${8 * factor}px`,
});

export const getAttuTheme = (mode: PaletteMode) => {
  const commonThemes = getCommonThemes(mode);

  return {
    ...commonThemes,
    components: {
      MuiTypography: {
        styleOverrides: {
          button: {
            textTransform: 'initial',
            lineHeight: '16px',
            fontWeight: 'bold',
            variants: [],
          },
          h1: {
            fontSize: '36px',
            lineHeight: '42px',
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
          },
          h2: {
            lineHeight: '24px',
            fontSize: '28px',
            fontWeight: 'bold',
          },
          h3: {
            lineHeight: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
          },
          h4: {
            fontWeight: 500,
            lineHeight: '23px',
            fontSize: '20px',
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '24px',
          },
          h6: {
            fontWeight: 'normal',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.01em',
          },
          body1: {
            fontSize: '14px',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '12px',
            lineHeight: '16px',
          },
          caption: {
            fontSize: '10px',
            lineHeight: '12px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'initial',
            fontWeight: 'bold',
            variants: [],
          },
          text: {
            '&:hover': {
              backgroundColor: commonThemes.palette.primary.light,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          spacing: {
            padding: commonThemes.spacing(4),
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: `${commonThemes.spacing(1)} ${commonThemes.spacing(4)}`,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: commonThemes.spacing(4),
            paddingBottom: commonThemes.spacing(1),
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          contained: {
            marginLeft: 0,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {},
      },
      MuiFilledInput: {
        styleOverrides: {
          underline: {
            '&:before': {
              borderBottom: 'none',
            },
            borderWidth: 1,
            borderColor: 'transparent',
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          underline: {
            '&:hover:not(.Mui-disabled):before': {
              borderWidth: 1,
            },
            borderWidth: 1,
            borderColor: 'transparent',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f0fdf4' : '#1b4332',
            color: mode === 'light' ? '#2a6f4e' : '#d8f3dc',
            '& .MuiChip-label': {
              fontWeight: 500,
            },
          },
          outlined: {
            borderColor: mode === 'light' ? '#94d2bd' : '#74c69d',
          },
          clickable: {
            '&:hover': {
              backgroundColor: mode === 'light' ? '#d1fae5' : '#2d6a4f',
            },
          },
          deleteIcon: {
            color: mode === 'light' ? '#40916c' : '#b7e4c7',
            '&:hover': {
              color: mode === 'light' ? '#1b4332' : '#95d5b2',
            },
          },
        },
      },
    },
  };
};

export default getAttuTheme;
