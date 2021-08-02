import {
  // for strict mode
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from '@material-ui/core/styles';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    milvusBlue: Palette['primary'];
    milvusGrey: Palette['primary'];
    milvusDark: Palette['primary'];
  }
  interface PaletteOptions {
    milvusBlue: PaletteOptions['primary'];
    milvusGrey: PaletteOptions['primary'];
    milvusDark: PaletteOptions['primary'];
  }
}

const commonThemes = {
  typography: {
    fontFamily: [
      'Roboto',
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
      main: '#06aff2',
      light: '#bfdeff',
      dark: '#0689D2',
    },
    secondary: {
      light: '#82d3ba',
      main: '#31b78d',
      dark: '#279371',
    },
    error: {
      main: '#ff4605',
      light: '#ff8f68',
      dark: '#cd3804',
    },
    milvusBlue: {
      main: '#f8f8fc',
      dark: '#dcdce3',
    },
    milvusGrey: {
      main: '#aeaebb',
      light: '#dcdce3',
      dark: '#82838e',
      contrastText: '#f8f8fc',
    },
    milvusDark: {
      main: '#010e29',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1025,
      lg: 1200,
      xl: 1920,
    },
  },
  spacing: (factor: number) => `${8 * factor}px`,
};

export const theme = createMuiTheme({
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
        lineHeight: '20px',
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
    MuiFilledInput: {
      root: {
        backgroundColor: '#f9f9f9',

        '&:hover': {
          backgroundColor: '#f9f9f9',
        },
      },
    },
  },
});
