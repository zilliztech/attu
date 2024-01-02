import { makeStyles, Theme } from '@material-ui/core';

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

    '& textarea': {
      border: `1px solid ${theme.palette.attuGrey.main}`,
      borderRadius: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(1),
      overflow: 'scroll',
      height: '130px',
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
      minWidth: '116px',
    },
  },
  s2: {
    position: 'relative',
    textAlign: 'right',
  },
  s3: {},
  selector: {
    display: 'block',
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
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 0,
    width: 'calc(100vw - 500px)', // replace 300px with the actual width of your form
    height: `calc(100vh - 108px)`,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& .left': {
      display: 'flex',
      alignItems: 'center',

      '& .text': {
        color: theme.palette.attuGrey.main,
      },
    },
    '& .right': {
      '& .btn': {
        marginRight: theme.spacing(1),
      },
      '& .icon': {
        fontSize: '16px',
      },
    },
  },
  menuLabel: {
    minWidth: '108px',

    padding: theme.spacing(0, 1),
    margin: theme.spacing(0, 1),

    backgroundColor: '#fff',
    color: theme.palette.attuGrey.dark,
  },
  menuItem: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuGrey.dark,
  },
  error: {
    color: theme.palette.error.main,
  },

  vectorTableCell: {
    display: 'flex',
    whiteSpace: 'nowrap'
  },
}));
