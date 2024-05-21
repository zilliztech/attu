import { makeStyles, Theme } from '@material-ui/core';

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
    borderRadius: '0',
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
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    padding: '0',

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
  },

  searchResults: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: '0 8px',
    overflow: 'auto',
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    marginBottom: theme.spacing(1),

    '& .left': {
      display: 'flex',

      '& .MuiFilledInput-adornedEnd': {
        paddingRight: 0,
      },
    },
    '& .right': {},
  },

  filterInput: {
    width: '360px',
    marginRight: '8px',
    '& .MuiFormHelperText-root': {
      display: 'none',
    },
  },
}));
