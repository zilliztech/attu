import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
    '& .MuiFilledInput-adornedEnd': {
      paddingRight: 0,
    },
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
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
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
  menuBtn: {
    display: 'flex',
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 14,
    '& button': {
      width: 36,
      height: 36,
    },
  },
  menu: {
    '& ul': {
      padding: 0,
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
    width: 380,
    padding: `0 8px`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& .address': {
      display: 'grid',
      gridTemplateColumns: '24px 1fr',
      gap: 4,
      color: theme.palette.text.primary,
      fontSize: '14px',
      padding: '12px 0',
      '& .text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 200,
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
      fontSize: 11,
      lineHeight: 1.5,
      padding: '12px 0',
      width: 130,
      fontStyle: 'italic',
    },
    '& .deleteIconBtn': {
      padding: '8px 0',
      '& svg': {
        fontSize: '14px',
      },
      height: 16,
      lineHeight: '16px',
      margin: 0,
    },
  },
}));
