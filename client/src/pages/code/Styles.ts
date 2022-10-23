import { makeStyles, Theme } from '@material-ui/core';

export const getPlaygroundStyles = makeStyles((theme: Theme) => ({
  selector: {
    width: '320px',
    marginTop: theme.spacing(1),
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0, 0, 1),
  },

  cmContainer: {
    display: 'flex',
  }
}));
