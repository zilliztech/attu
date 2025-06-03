import { Theme } from '@mui/material';

export const markdownStyles = (theme: Theme) => ({
  '& .markdown-body': {
    backgroundColor: 'transparent',
    fontSize: '14px',
    '& pre': {
      borderRadius: '6px',
      padding: '16px',
      overflow: 'auto',
      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
      margin: 0,
    },
    '& code': {
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontSize: '0.9em',
      backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '16px 0',
      color: 'inherit',
      '& th, & td': {
        border: `1px solid ${theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'}`,
        padding: '8px',
      },
      '& th': {
        backgroundColor:
          theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
      },
      '& tr': {
        '&:nth-of-type(even)': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
        },
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
    '& blockquote': {
      margin: '16px 0',
      padding: '0 16px',
      borderLeft: `4px solid ${theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'}`,
      color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary',
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
    },
    '& a': {
      color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      color: 'inherit',
      marginTop: '24px',
      marginBottom: '16px',
    },
    '& p': {
      color: 'inherit',
      marginTop: '16px',
      marginBottom: '16px',
      '&:first-of-type': {
        marginTop: 0,
      },
      '&:last-of-type': {
        marginBottom: 0,
      },
    },
  },
});
