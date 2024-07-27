import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0, 3),
    position: 'relative',
  },
  titleWrapper: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    padding: theme.spacing(3, 0),
    '& svg': {
      fontSize: 15,
      marginLeft: theme.spacing(0.5),
    },
  },
  input: {
    margin: theme.spacing(0.5, 0, 0),
  },
  toggle: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
  },
  star: {
    position: 'absolute',
    top: -48,
    right: -8,
    marginTop: theme.spacing(1),
    alignItems: 'center',
    height: '32px',
    lineHeight: '32px',
    color: '#333',
    background: '#f1f1f1',
    padding: theme.spacing(0.5, 0, 0.5, 1),
    fontSize: 13,
    display: 'block',
    width: '132px',
    textDecoration: 'none',
    marginRight: theme.spacing(1),
    fontWeight: 500,
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  menu: {
    '& ul': {
      padding: '0',
      maxHeight: '400px',
      overflowY: 'auto',
    },
  },
  icon: {
    verticalAlign: '-5px',
    marginRight: theme.spacing(1),
  },
  connection: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    width: 360,
    padding: `0 16px`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    cursor: 'pointer',

    '& .address': {
      display: 'grid',
      gridTemplateColumns: '20px 1fr',
      gap: 4,
      color: theme.palette.text.primary,
      fontSize: '14px',
      padding: '12px 0',
      '& .text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 200,
        wordWrap: 'break-word',
      },
    },

    '& .icon': {
      verticalAlign: '-3px',
      marginRight: 8,
      fontSize: '14px',
    },

    '& .time': {
      color: theme.palette.text.secondary,
      fontSize: '12px',
      padding: '12px 0',
    },
  },
}));
