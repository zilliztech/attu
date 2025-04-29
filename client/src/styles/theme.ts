import { PaletteMode } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Theme } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    mono: true; // Custom variant
  }
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    lightGrey?: string; // Adding the light property to the TypeBackground interface
    grey?: string;
  }
  interface Palette {
    background: TypeBackground; // Ensure the background interface uses the updated TypeBackground
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
      grey: mode === 'light' ? grey[200] : grey[800],
      lightGrey: mode === 'light' ? grey[100] : grey[800],
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
          mono: {
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 12,
            lineHeight: 1.5,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({
            theme,
            ownerState,
          }: {
            theme: Theme;
            ownerState: ButtonProps;
          }) => ({
            padding: theme.spacing(1, 3),
            textTransform: 'initial',
            fontWeight: 'bold',
            ...(ownerState.variant === 'text' && {
              padding: theme.spacing(1),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.paper,
              },
            }),
            ...(ownerState.variant === 'contained' && {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor:
                  ownerState.color === 'secondary'
                    ? '#fc4c02'
                    : theme.palette.primary.dark,
              },
            }),
            ...(ownerState.disabled && {
              pointerEvents: 'none',
            }),
          }),
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.background.paper,
            }),
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              backgroundColor: '#fc4c02',
              color: '#fff',
            },
          },
        ],
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
      MuiTreeItem: {
        styleOverrides: {
          root: {
            fontSize: '15px',
            color: commonThemes.palette.primary,
            backgroundColor: commonThemes.palette.background.default,
            '& .MuiTreeItem-iconContainer': {
              width: 'auto',
              color: '#666',
            },
            '& .MuiTreeItem-group': {
              marginLeft: 0,
              '& .MuiTreeItem-content': {
                padding: '0 0 0 8px',
              },
            },
            '& .MuiTreeItem-label:hover': {
              backgroundColor: 'none',
            },
            '& .MuiTreeItem-content': {
              width: 'auto',
              padding: '0',
              '&.Mui-focused': {
                backgroundColor: 'rgba(10, 206, 130, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(10, 206, 130, 0.28)',
              },
              '&.Mui-focused.Mui-selected': {
                backgroundColor: 'rgba(10, 206, 130, 0.28) !important',
              },
              '&:hover': {
                backgroundColor: 'rgba(10, 206, 130, 0.08)',
              },
              '& .MuiTreeItem-label': {
                background: 'none',
              },
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: commonThemes.palette.background.paper,
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
          },
          list: {
            padding: '8px 0',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '14px',
            padding: '8px 16px',
            minHeight: '36px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(10, 206, 130, 0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(10, 206, 130, 0.16)',
              '&:hover': {
                backgroundColor: 'rgba(10, 206, 130, 0.24)',
              },
            },
            '&.Mui-disabled': {
              opacity: 0.6,
            },
            '& .MuiListItemIcon-root': {
              color: mode === 'light' ? '#666' : '#aaa',
              minWidth: '36px',
            },
          },
        },
      },
    },
  };
};

export default getAttuTheme;
