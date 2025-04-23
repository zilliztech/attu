import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '15px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    '& .MuiSvgIcon-root': {
      fontSize: '14px',
      color: theme.palette.text.primary,
    },
  },
  collectionNode: {
    minHeight: '24px',
    lineHeight: '24px',
    display: 'flex',
  },
  collectionName: {
    display: 'flex',
    alignItems: 'center',
    width: 'calc(100% - 45px)',
    '& .collectionName': {
      minWidth: 36,
    },
  },
  dbName: {
    width: 'calc(100% - 30px)',
  },
  count: {
    fontSize: '13px',
    fontWeight: 500,
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    pointerEvents: 'none',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    position: 'absolute',
    right: 6,
    top: 8,
    zIndex: 1,
  },
  loaded: {
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
  },
  unloaded: {
    border: `1px solid ${theme.palette.primary.main}`,
    background: '#fff !important',
  },
  loading: {
    border: `1px solid ${theme.palette.primary.light}`,
    backgroundColor: `${theme.palette.primary.light} !important`,
  },
  noIndex: {
    border: `1px solid ${theme.palette.text.disabled}`,
    backgroundColor: theme.palette.text.disabled,
  },
  menuItem: {
    fontSize: '14px',
    boderBottom: `1px solid ${theme.palette.divider}`,
  },
}));
