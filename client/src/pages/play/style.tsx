import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '0',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 8,
    height: '100vh',
    padding: theme.spacing(2),
  },
  leftPane: {
    flex: 1,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  rightPane: {
    flex: 1,
    padding: `0 ${theme.spacing(2)}`,
    marginLeft: theme.spacing(2),
    display: 'flex',
    overflow: 'hidden',
  },
  response: {
    width: '100%',
    overflow: 'auto',
    lineHeight: '18px',

    '& pre': {
      borderRadius: '4px',
    },
  },
  editor: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
  },
}));

export const getCMStyle = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    '&.cm-editor': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      height: '100%',
      borderRadius: '4px',
    },
    '&.cm-editor .cm-cursor': {
      borderColor: theme.palette.text.primary,
    },
    '&.cm-editor .cm-scroller': {
      padding: '12px 0',
      borderRadius: '4px',
      overflow: 'auto',
    },
    '.cm-line': { padding: ' 0 4px 0 2px' },
    '.cm-content': {
      fontSize: '13px',
      fontFamily: 'IBM Plex Mono, monospace',
      padding: 0,
    },
    '.cm-activeLine': { backgroundColor: 'transparent' },
    '.cm-gutters': {
      fontSize: '13px',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 2px 0 20px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
    // auto completion box style
    '.cm-tooltip.cm-tooltip-autocomplete': {
      border: 'none',
      borderRadius: '4px',
      transform: 'translateX(-20px)', // adjust box position to align with the text
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.palette.grey[800]
          : theme.palette.background.paper,
    },
    '.cm-tooltip.cm-tooltip-autocomplete>ul': {
      fontFamily: 'IBM Plex Mono, monospace',
      maxHeight: '208px',
      border: '1px solid transparent',
      borderRadius: '4px',
      boxShadow: '0 4px 16px rgb(52 56 59 / 13%)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete>ul li': {
      display: 'flex',
      gap: '12px',
      flexDirection: 'row',
      maxWidth: '400px',
      minWidth: '300px',
      whiteSpace: 'normal',
      paddingTop: '6px',
      border: 'none',
      borderColor: '#e2e3e5',
      paddingBottom: '8px',
      padding: '6px 12px 8px',
      transition: 'background 0.2s ease-in-out',
    },
    '.cm-tooltip-autocomplete .cm-completionLabel': {
      flex: 1,
      display: 'block',
      fontSize: '13.5px',
      fontWeight: 500,
      order: 1,
    },
    '.cm-tooltip-autocomplete .cm-completionLabel .cm-completionMatchedText': {
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    '.cm-tooltip-autocomplete .cm-completionIcon': {
      display: 'block',
      fontSize: '13.5px',
      order: 2,
    },
    '.cm-tooltip-autocomplete .cm-completionDetail': {
      display: 'block',
      fontSize: '13.5px',
      order: 2,
    },
    '.cm-tooltip-autocomplete>ul>li[aria-selected=true]': {
      color: theme.palette.text.primary,
      backgroundColor: isDark
        ? 'rgba(10, 206, 130, 0.4)'
        : 'rgba(10, 206, 130, 0.2)',
    },
    '.cm-tooltip-autocomplete>ul>li[aria-selected=true] .cm-autocomplete-option-tab-badge':
      {
        opacity: 1,
      },
    '.cm-tooltip-autocomplete .cm-autocomplete-option-tab-badge': {
      display: 'inline-block',
      fontSize: '10px',
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: '2px',
      padding: '0 2px',
      height: '14px',
      lineHeight: '14px',
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out',
      order: 3,
    },
    '.milvus-http-request-highlight': {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(10, 206, 130, 0.08)',
      borderRadius: '3px',
    },
    '.milvus-http-request-error': {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderRadius: '3px',
    },
    '.playground-toolbar': {
      display: 'inline',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
    },
    '.playground-codelens': {
      display: 'flex',
      alignItems: 'center',
    },
    '.playground-codelens .codelens-item': {
      position: 'relative',
      color: isDark ? '#999999' : '#919191',
      cursor: 'pointer',
      fontSize: '11px',
      lineHeight: '17px',
      letterSpacing: '0.5px',
      textDecoration: 'none',
      transition: 'color 0.2s ease-in-out',

      '&:hover': {
        color: theme.palette.primary.main,
      },

      '&:not(:last-child)': {
        marginRight: '16px',

        '&::after': {
          position: 'absolute',
          right: '-8px',
          top: '3px',
          display: 'inline-block',
          content: '""',
          borderRight: `1px solid ${isDark ? '#666666' : '#e0e0e0'}`,
          height: '10px',
        },
      },
    },
    '.cm-line .token-node': {
      color: '#ff79c6',
    },
    '.cm-line .cm-widgetBuffer': {
      height: '17px',
    },
    '.cm-gutter .cm-codelens-marker': {
      paddingTop: '17px',
    },
  };
};
