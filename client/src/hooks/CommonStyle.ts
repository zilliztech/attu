import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: `${theme.spacing(4)}px ${theme.spacing(4)}px`,
    backgroundColor: '#f4f4f4',
  },
  titleWrapper: {
    background: theme.palette.primary.light,
    color: '#fff',
    padding: theme.spacing(2),
    '& h2': {
      fontSize: '26px',
    },
  },
  paper: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(4),
  },
  titleContainer: {
    display: 'flex',
    padding: theme.spacing(1, 0, 2),
  },
  h2: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '0 10px 0 0',
  },
  tab: {
    background: theme.palette.primary.main,
    color: '#fff',
  },
}));

export function usePageStyles() {
  return useStyles();
}
