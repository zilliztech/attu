import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const getVectorSearchStyles = makeStyles((theme: Theme) => ({
  pageContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0),
    width: 360,
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,

    '& textarea': {
      border: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(1),
      overflow: 'scroll',
      height: '65px',
      maxWidth: '100%',
      width: '100%',
      display: 'block',
      boxSizing: 'border-box',
    },
    '& .text': {
      marginBottom: theme.spacing(1),
      fontWeight: '600',
    },
    overflow: 'hidden',
  },
  s1: {
    '& .wrapper': {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(2),
    },

    '& .MuiSelect-root': {
      width: '116px',
    },
  },
  s2: {
    position: 'relative',
    textAlign: 'right',
  },
  s3: {},
  selector: {
    width: '50%',
    marginBottom: theme.spacing(0),
  },
  exampleBtn: {
    marginRight: theme.spacing(1),
  },
  paramsWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },

  resultsWrapper: {
    border: `1px solid ${theme.palette.divider}`,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 0,
    width: `calc(100% - 396px)`,
    padding: theme.spacing(1),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    paddingBottom: theme.spacing(1),
    '& .icon': {
      fontSize: '16px',
    },

    '& .left': {
      display: 'flex',
      alignItems: 'center',

      '& .text': { fontSize: 12, minWidth: '92px' },
      '& .MuiButton-root': {
        marginRight: theme.spacing(1),
      },
    },
    '& .right': {},
  },
  menuLabel: {
    minWidth: '108px',

    padding: theme.spacing(0, 1),
    margin: theme.spacing(0, 1),

    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
  },
  menuItem: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.text.secondary,
  },
  error: {
    display: 'block',
    marginTop: theme.spacing(-1),
    padding: '8px 0',
    color: theme.palette.error.main,
  },

  vectorTableCell: {
    display: 'flex',
    whiteSpace: 'nowrap',
  },

  filterExpressionInput: {
    width: '33vw',
    '& .MuiInput-underline:before': {
      borderWidth: 1,
    },
    '& .MuiInput-underline:after': {
      borderWidth: 1,
    },
  },
}));
