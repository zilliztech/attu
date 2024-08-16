import { PaletteMode } from '@mui/material';

// define types for the common theme
declare module '@mui/material/styles/createPalette' {
  interface Palette {
    attuGrey: Palette['primary'];
    attuDark: Palette['primary'];
  }
  interface PaletteOptions {
    attuGrey: PaletteOptions['primary'];
    attuDark: PaletteOptions['primary'];
  }
}

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
      light: mode === 'light' ? '#65BA74' : '#4caf9f',
      dark: mode === 'light' ? '#08a568' : '#078b63',
    },
    secondary: {
      light: '#82d3ba',
      main: '#0ACE82',
      dark: '#279371',
    },
    error: {
      main: '#ff4605',
      light: mode === 'light' ? '#ff8f68' : '#ff6a3a',
      dark: mode === 'light' ? '#cd3804' : '#b33900',
    },
    attuGrey: {
      main: mode === 'light' ? '#aeaebb' : '#565665',
      light: mode === 'light' ? '#dcdce3' : '#838394',
      dark: mode === 'light' ? '#82838e' : '#34343f',
      contrastText: mode === 'light' ? '#f8f8fc' : '#e0e0e5',
    },
    attuDark: {
      main: mode === 'light' ? '#010e29' : '#0d1b34',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
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
          root: {
            backgroundColor: mode === 'light' ? '#f4f4f4' : '#303030',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#f4f4f4' : '#404040',
            },
          },
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
    },
  };
};

export default getAttuTheme;
