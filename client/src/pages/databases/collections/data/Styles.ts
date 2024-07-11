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
    gap: theme.spacing(2),

    '& .left': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
      padding: theme.spacing(0, 0, 0, 0),
      fontSize: theme.spacing(2),
      backgroundColor: '#f4f4f4',

      '& .expression': {
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing(0, 1.5),
        backgroundColor: '#f4f4f4',
      },
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
    width: 180,
  },
}));
