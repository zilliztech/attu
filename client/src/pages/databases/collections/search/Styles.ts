import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const getQueryStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  inputArea: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 'max-content',
    padding: 0,
  },

  accordions: {
    display: 'flex',
    width: '220px',
    flexDirection: 'column',
    flexShrink: 0,
    padding: '0 8px 8px 0',
    minHeight: 'calc(100vh - 164px)',
    height: 'calc(100vh - 164px)',
    overflow: 'auto',

    borderRight: `1px solid ${theme.palette.divider}`,
    '& .MuiAccordion-root.Mui-expanded': {
      margin: 0,
    },
    '& .MuiAccordion-root.Mui-expanded:before': {
      opacity: 1,
    },
  },

  accordion: {
    boxShadow: 'none',
    padding: '0',
    border: '1px solid transparent',

    '&.highlight': {
      border: `1px solid ${theme.palette.secondary.main}`,
      borderRadius: 8,
    },

    // borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiAccordionSummary-root': {
      minHeight: '48px',
      padding: '0 12px 0 0',
      '& .MuiAccordionSummary-expandIcon': {
        padding: 4,
      },
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
      padding: '8px 0',
    },
    '& .MuiAccordionSummary-expandIcon': {
      alignSelf: 'flex-start',
      position: 'relative',
      top: '4px',
    },
  },
  accordionDetail: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    '& .textarea': {
      height: '100px',
      marginBottom: '8px',
    },
    '& .paramsWrapper': {
      '& .MuiFormControl-root': {
        width: '100%',
      },
    },
  },
  heading: {
    flexShrink: 0,
  },
  checkbox: {
    display: 'flex',
    flexDirection: 'row',
    '& .MuiCheckbox-root': {
      padding: 0,
      marginRight: 4,
      alignSelf: 'flex-start',
      postion: 'relative',
      top: '2px',
    },
    '& .field-name': {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '20px',
      wordBreak: 'break-all',
    },
    '& .bold': {
      fontWeight: 600,
    },
    '& .vector-type': {
      color: theme.palette.text.secondary,
      fontSize: '12px',
      lineHeight: '20px',
      '& i': {
        marginLeft: '4px',
        fontSize: '10px',
        fontWeight: 600,
        color: theme.palette.primary.light,
      },
    },
  },

  vectorInputBox: {
    height: '124px',
    margin: '0 0 8px 0',
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
    cursor: 'text',
    boxShadow: '0 1px 0 transparent',
    transition: `box-shadow 0.3s ease`,
    '&:hover': {
      boxShadow: '0 1px 0 #000',
    },
    '&:active': {
      boxShadow: `0 1px 0 ${theme.palette.primary.main}`,
    },
    '&.focused': {
      boxShadow: `0 2px 0 ${theme.palette.primary.main}`,
    },
  },

  searchControls: {
    display: 'flex',
    flexDirection: 'column',
    width: 120,
    minWidth: 120,
    padding: '0 8px',
    borderRight: `1px solid ${theme.palette.divider}`,

    '& .selector': {
      marginBottom: '8px',
    },
    '& span button': {
      width: '100%',
      height: '100%',
    },
  },

  searchResults: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: 8,
    overflow: 'auto',
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0, 0, 1),
    gap: theme.spacing(1),

    '& .left': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing(1),
      flex: 1,

      '& .textarea': {
        width: '100%',
        '& .MuiFormHelperText-root': {
          display: 'none',
        },
      },
    },

    '& .right': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  },

  genBtn: {
    marginBottom: 8,
  },

  btn: {
    height: 56,
    width: 80,
  },

  explorer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    flexGrow: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    padding: '4px 8px',
  },
  resetBtn: {
    position: 'absolute',
    top: 8,
    left: 90,
    zIndex: 1,
    padding: '4px 8px',
  },
}));

export const getDataExplorerStyle = makeStyles((theme: Theme) => ({
  root: {
    '& .nodeInfo': {
      display: 'flex',
      flexDirection: 'column',
      padding: '8px',
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 8,
      boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
      maxWidth: 240,
      overflow: 'auto',
      zIndex: 1,
      '& .wrapper': {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    
        justifyContent: 'center',
        '& img': {
          display: 'inline-block',
          maxWidth: 120,
          maxHeight: 120,
          objectFit: 'contain',
        },
      },
    },
  },
  selectedNodes: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: 8,
    right: 8,
    borderRadius: 8,
    gap: 8,
    maxHeight: '100%',
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
    '& .nodeInfo': {
      boxShadow: 'none',
    },
  },
}));
