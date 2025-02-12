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
    overflow: 'auto',
  },
  rightPane: {
    flex: 1,
    padding: theme.spacing(2),
    marginLeft: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.grey,
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
  return {
    '&.cm-editor': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
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
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      border: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 22px 0 26px',
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
      transform: 'translateX(-20px)', // adjust box position to align with the text
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
      flexDirection: 'column',
      maxWidth: '400px',
      minWidth: '300px',
      whiteSpace: 'normal',
      paddingTop: '6px',
      border: 'none',
      borderColor: '#e2e3e5',
      borderBottom: '1px solid transparent',
      paddingBottom: '8px',
      padding: '6px 12px 8px',
      borderLeft: '4px solid transparent',
    },
    '.cm-tooltip-autocomplete .cm-completionLabel': {
      display: 'block',
      fontSize: '13.5px',
      fontWeight: 'bold',
      order: 1,
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
      backgroundColor: '#fff',
      color: '#484D52',
      borderColor: '#e2e3e5',
      borderLeftColor: '#1a6ce7',
    },
    '.cm-request-highlight': {
      backgroundColor: 'rgba(255, 255, 0, 0.2)',
      borderRadius: '3px',
    },
  };
};
