import {
  // for strict mode
  unstable_createMuiStrictModeTheme as createMuiTheme,
  adaptV4Theme,
} from '@mui/material/styles';

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

const commonThemes = {
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
    primary: {
      main: '#0ACE82',
      light: '#65BA74',
      dark: '#08a568',
    },
    secondary: {
      light: '#82d3ba',
      main: '#0ACE82',
      dark: '#279371',
    },
    error: {
      main: '#ff4605',
      light: '#ff8f68',
      dark: '#cd3804',
    },
    attuGrey: {
      main: '#aeaebb',
      light: '#dcdce3',
      dark: '#82838e',
      contrastText: '#f8f8fc',
    },
    attuDark: {
      main: '#010e29',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  spacing: (factor: number) => `${8 * factor}px`,
};

export const theme = createMuiTheme(
  adaptV4Theme({
    ...commonThemes,
    overrides: {
      MuiTypography: {
        button: {
          textTransform: 'initial',
          lineHeight: '16px',
          fontWeight: 'bold',
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
        // style for element p
        body1: {
          fontSize: '14px',
          lineHeight: 1.5,
        },
        // small caption
        body2: {
          fontSize: '12px',
          lineHeight: '16px',
        },
        // tiny caption
        caption: {
          fontSize: '10px',
          lineHeight: '12px',
        },
      },
      MuiButton: {
        root: {
          textTransform: 'initial',
          fontWeight: 'bold',
        },
        text: {
          '&:hover': {
            backgroundColor: commonThemes.palette.primary.light,
          },
        },
      },
      MuiDialog: {
        paper: {
          borderRadius: 8,
        },
      },
      MuiDialogActions: {
        spacing: {
          padding: commonThemes.spacing(4),
        },
      },
      MuiDialogContent: {
        root: {
          padding: `${commonThemes.spacing(1)} ${commonThemes.spacing(4)}`,
        },
      },
      MuiDialogTitle: {
        root: {
          padding: commonThemes.spacing(4),
          paddingBottom: commonThemes.spacing(1),
        },
      },
      MuiFormHelperText: {
        contained: {
          marginLeft: 0,
        },
      },
      MuiTextField: {
        root: {},
      },
      MuiFilledInput: {
        root: {
          backgroundColor: '#f4f4f4',

          '&:hover': {
            backgroundColor: '#f4f4f4',
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

      MuiInput: {
        underline: {
          '&:hover:not(.Mui-disabled):before': {
            borderWidth: 1,
          },
          borderWidth: 1,
          borderColor: 'transparent',
        },
      },
    },
  })
);
