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
    background: '#f7f7f7',
    minWidth: '500px',
    width: '50%',
    border: '1px dotted #c2c2c2',
  },
  result: {
    background: '#fff',
    width: '50%',
  },
}));
