import { makeStyles, Theme } from '@material-ui/core';

export const getPlaygroundStyles = makeStyles((theme: Theme) => ({
  selector: {
    width: '320px',
    marginTop: theme.spacing(1),
  },
  sdk: {
    width: '150px',
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    margin: theme.spacing(0, 0, 2),
  },

  cmContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(2),
    '& >div': {
    },
  },
  editor: {
    background: '#fff',
    minWidth: '500px',
    width: '50%',
  },
  result: {
    background: '#fff',
    width: '50%',
    color: '#eee'
  },
}));
