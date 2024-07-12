import { makeStyles, Theme } from '@material-ui/core';

export const getQueryStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  emptyCard: {
    height: '100%',
    boxShadow: 'none',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
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
  selector: {
    width: 160,
  },
  outputs: {
    height: 56,
    width: 140,
  },
  btn: {
    height: 56,
    width: 80,
  },
}));
