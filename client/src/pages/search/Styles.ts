import { makeStyles, Theme } from '@material-ui/core';

export const getVectorSearchStyles = makeStyles((theme: Theme) => ({
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(0),

    '& textarea': {
      border: `1px solid ${theme.palette.attuGrey.main}`,
      borderRadius: theme.spacing(0.5),
      padding: theme.spacing(0.5, 1),
      marginTop: theme.spacing(0),
      overflow: 'scroll',
      height: '130px',
      maxWidth: '100%',
      width: '100%',
      display: 'block',
      boxSizing: 'border-box',
    },
    '& .text': {
      marginBottom: theme.spacing(2),
    },
    height: '210px',
    overflow: 'hidden',
  },
  s1: {
    '& .MuiSelect-root': {
      minWidth: '240px',
    },
  },
  s2: {
    minWidth: '600px',
    position: 'relative',
  },
  s3: {
    minWidth: '260px',
  },
  selector: {
    display: 'block',
    marginBottom: theme.spacing(2),
  },
  exampleBtn: {
    right: theme.spacing(2),
    top: theme.spacing(1.5),
    position: 'absolute',
  },
  paramsWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },

  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    padding: theme.spacing(2, 0),

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
}));
