import { PaletteMode } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Theme } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    mono: true;
  }
}

declare module '@mui/material/styles' {
  interface TypeBackground {
    lightGrey?: string;
    grey?: string;
    light?: string;
  }
  interface Palette {
    background: TypeBackground;
  }
}

const colors = {
  primary: {
    main: '#0ACE82',
    light: {
      light: '#f0fdf4',
      dark: '#1b4332',
    },
    dark: {
      light: '#08a568',
      dark: '#078b63',
    },
  },
  secondary: {
    main: '#1890FF',
    light: {
      light: '#E6F4FF',
      dark: '#003A8C',
    },
    dark: {
      light: '#096DD9',
      dark: '#0050B3',
    },
  },
  error: {
    main: '#ff4605',
    light: {
      light: '#ff8f68',
      dark: '#ff6a3a',
    },
    dark: {
      light: '#cd3804',
      dark: '#b33900',
    },
  },
};

const spacing = (factor: number) => `${8 * factor}px`;

const typography = {
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
  button: {
    textTransform: 'initial',
    lineHeight: '16px',
    fontWeight: 'bold',
  },
};

const getCommonThemes = (mode: PaletteMode) => ({
  typography,
  palette: {
    mode,
    primary: {
      main: colors.primary.main,
      light:
        mode === 'light'
          ? colors.primary.light.light
          : colors.primary.light.dark,
      dark:
        mode === 'light' ? colors.primary.dark.light : colors.primary.dark.dark,
    },
    secondary: {
      main: colors.secondary.main,
      light:
        mode === 'light'
          ? colors.secondary.light.light
          : colors.secondary.light.dark,
      dark:
        mode === 'light'
          ? colors.secondary.dark.light
          : colors.secondary.dark.dark,
    },
    error: {
      main: colors.error.main,
      light:
        mode === 'light' ? colors.error.light.light : colors.error.light.dark,
      dark: mode === 'light' ? colors.error.dark.light : colors.error.dark.dark,
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      grey: mode === 'light' ? grey[200] : grey[800],
      lightGrey: mode === 'light' ? grey[100] : grey[800],
    },
  },
  spacing,
});

export const getAttuTheme = (mode: PaletteMode) => {
  const commonThemes = getCommonThemes(mode);
  const isLight = mode === 'light';

  return {
    ...commonThemes,
    components: {
      MuiTypography: {
        styleOverrides: {
          ...typography,
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
                    ? theme.palette.secondary.dark
                    : theme.palette.primary.dark,
              },
            }),
            ...(ownerState.disabled && {
              pointerEvents: 'none',
              opacity: 0.6,
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
            style: ({ theme }: { theme: Theme }) => ({
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.background.paper,
            }),
          },
        ],
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          spacing: {
            padding: spacing(4),
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: `${spacing(1)} ${spacing(4)}`,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: spacing(4),
            paddingBottom: spacing(1),
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
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: isLight
                  ? colors.primary.main
                  : colors.primary.light.dark,
              },
            },
          },
        },
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
            backgroundColor: isLight
              ? colors.primary.light.light
              : colors.primary.light.dark,
            color: isLight
              ? colors.primary.dark.light
              : colors.primary.light.light,
            '& .MuiChip-label': {
              fontWeight: 500,
            },
          },
          outlined: {
            borderColor: isLight
              ? colors.primary.main
              : colors.primary.light.dark,
          },
          clickable: {
            '&:hover': {
              backgroundColor: isLight
                ? colors.primary.light.light
                : colors.primary.dark.dark,
            },
          },
          deleteIcon: {
            color: isLight
              ? colors.primary.dark.light
              : colors.primary.light.light,
            '&:hover': {
              color: isLight
                ? colors.primary.dark.dark
                : colors.primary.light.dark,
            },
          },
        },
      },
      MuiTreeItem: {
        styleOverrides: {
          root: {
            fontSize: '15px',
            color: commonThemes.palette.primary.main,
            backgroundColor: commonThemes.palette.background.default,
            '& .MuiTreeItem-iconContainer': {
              width: 'auto',
              color: isLight ? '#666' : '#aaa',
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
                backgroundColor: isLight
                  ? 'rgba(10, 206, 130, 0.08)'
                  : 'rgba(10, 206, 130, 0.16)',
              },
              '&.Mui-selected': {
                backgroundColor: isLight
                  ? 'rgba(10, 206, 130, 0.28)'
                  : 'rgba(10, 206, 130, 0.36)',
              },
              '&.Mui-focused.Mui-selected': {
                backgroundColor: isLight
                  ? 'rgba(10, 206, 130, 0.28) !important'
                  : 'rgba(10, 206, 130, 0.36) !important',
              },
              '&:hover': {
                backgroundColor: isLight
                  ? 'rgba(10, 206, 130, 0.08)'
                  : 'rgba(10, 206, 130, 0.16)',
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
              backgroundColor: isLight
                ? 'rgba(10, 206, 130, 0.08)'
                : 'rgba(10, 206, 130, 0.16)',
            },
            '&.Mui-selected': {
              backgroundColor: isLight
                ? 'rgba(10, 206, 130, 0.16)'
                : 'rgba(10, 206, 130, 0.24)',
              '&:hover': {
                backgroundColor: isLight
                  ? 'rgba(10, 206, 130, 0.24)'
                  : 'rgba(10, 206, 130, 0.32)',
              },
            },
            '&.Mui-disabled': {
              opacity: 0.6,
            },
            '& .MuiListItemIcon-root': {
              color: isLight ? '#666' : '#aaa',
              minWidth: '36px',
            },
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '&.MuiSnackbar-anchorOriginTopCenter': {
              top: { xs: 56, md: 72 },
            },
            '&.MuiSnackbar-anchorOriginTopRight': {
              top: { xs: 56, md: 72 },
              right: (theme: Theme) => theme.spacing(1),
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            wordBreak: 'break-all',
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              alignItems: 'center',
              padding: '9px 0',
            },
            '& .MuiAlert-message': {
              padding: '9px 0',
              display: 'flex',
              alignItems: 'center',
            },
          },
          standardSuccess: {
            backgroundColor: isLight ? colors.primary.light.light : colors.primary.light.dark,
            color: isLight ? colors.primary.dark.light : colors.primary.light.light,
          },
          standardError: {
            backgroundColor: isLight ? colors.error.light.light : colors.error.light.dark,
            color: isLight ? colors.error.dark.light : colors.error.light.light,
          },
          standardInfo: {
            backgroundColor: isLight ? colors.secondary.light.light : colors.secondary.light.dark,
            color: isLight ? colors.secondary.dark.light : colors.secondary.light.light,
          },
          standardWarning: {
            backgroundColor: isLight ? '#fff7e6' : '#2b2111',
            color: isLight ? '#d46b08' : '#ffa940',
          },
        },
      },
    },
  };
};

export default getAttuTheme;
