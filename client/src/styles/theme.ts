import { PaletteMode } from '@mui/material';
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
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    highlight: {
      light: string;
      dark: string;
    };
  }
}

const colors = {
  primary: {
    main: '#09B572',
    light: {
      light: '#f0fdf4',
      dark: '#1b4332',
    },
    dark: {
      light: '#07925E',
      dark: '#067A50',
    },
  },
  secondary: {
    main: '#1272CC',
    light: {
      light: '#E6F4FF',
      dark: '#003A8C',
    },
    dark: {
      light: '#0D5AA3',
      dark: '#0A4680',
    },
  },
  error: {
    main: '#D93C00',
    light: {
      light: '#FFEBE6',
      dark: '#7A1C00',
    },
    dark: {
      light: '#B33200',
      dark: '#8A2700',
    },
  },
  warning: {
    main: '#FF9800',
    light: {
      light: '#FFF4E5',
      dark: '#7A4A00',
    },
    dark: {
      light: '#E68A00',
      dark: '#B36B00',
    },
  },
  info: {
    main: '#2196F3',
    light: {
      light: '#E6F4FF',
      dark: '#0D3C61',
    },
    dark: {
      light: '#1A7BC9',
      dark: '#145FA0',
    },
  },
  success: {
    main: '#4CAF50',
    light: {
      light: '#E8F5E9',
      dark: '#1B5E20',
    },
    dark: {
      light: '#3D8B40',
      dark: '#2E7D32',
    },
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    default: '#F3F4F6',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  divider: '#E5E7EB',
  highlight: {
    light: '#FFE082',
    dark: '#003A8C',
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
    fontSize: '13px',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '10px',
    lineHeight: '12px',
  },
  mono: {
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 13,
    lineHeight: 1.8,
  },
  button: {
    textTransform: 'initial',
    lineHeight: '16px',
    fontWeight: '700',
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
    warning: {
      main: colors.warning.main,
      light:
        mode === 'light'
          ? colors.warning.light.light
          : colors.warning.light.dark,
      dark:
        mode === 'light' ? colors.warning.dark.light : colors.warning.dark.dark,
    },
    info: {
      main: colors.info.main,
      light:
        mode === 'light' ? colors.info.light.light : colors.info.light.dark,
      dark: mode === 'light' ? colors.info.dark.light : colors.info.dark.dark,
    },
    success: {
      main: colors.success.main,
      light:
        mode === 'light'
          ? colors.success.light.light
          : colors.success.light.dark,
      dark:
        mode === 'light' ? colors.success.dark.light : colors.success.dark.dark,
    },
    neutral: colors.neutral,
    background: {
      default:
        mode === 'light' ? colors.background.default : colors.neutral[900],
      paper: mode === 'light' ? colors.background.paper : colors.neutral[800],
      grey: mode === 'light' ? colors.neutral[200] : colors.neutral[700],
      lightGrey: mode === 'light' ? colors.neutral[100] : colors.neutral[800],
    },
    text: {
      primary: mode === 'light' ? colors.text.primary : colors.neutral[50],
      secondary: mode === 'light' ? colors.text.secondary : colors.neutral[400],
      disabled: mode === 'light' ? colors.text.disabled : colors.neutral[600],
    },
    divider: mode === 'light' ? colors.divider : colors.neutral[700],
    highlight: {
      light: colors.highlight.light,
      dark: colors.highlight.dark,
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
        defaultProps: {
          disableRipple: false,
        },
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
            transition: 'all 0.2s ease-in-out',
            ...(ownerState.variant === 'text' && {
              padding: theme.spacing(1),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.paper,
              },
              '&:active': {
                backgroundColor: theme.palette.primary.dark,
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
              '&:active': {
                backgroundColor:
                  ownerState.color === 'secondary'
                    ? theme.palette.secondary.dark
                    : theme.palette.primary.dark,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            }),
            ...(ownerState.variant === 'outlined' && {
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.paper,
              },
              '&:active': {
                backgroundColor: theme.palette.primary.dark,
              },
            }),
            ...(ownerState.disabled && {
              pointerEvents: 'none',
              opacity: 0.6,
              transform: 'none !important',
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
      MuiTab: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiMenuItem: {
        defaultProps: {
          disableRipple: true,
        },
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
            padding: '0 12px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
            gap: '4px',
            '& .MuiAlert-action': {
              padding: '0',
            },
            '& .MuiAlert-icon': {
              marginRight: '4px',
            },
            '& svg': {
              fontSize: '16px',
            },
          },
        },
      },
    },
  };
};

export default getAttuTheme;
