import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '15px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    '& .MuiTreeItem-iconContainer': {
      width: 'auto',
    },
    '& .MuiTreeItem-group': {
      marginLeft: 0,
      '& .MuiTreeItem-content': {
        padding: '0 0 0 8px',
      },
    },
    '& .MuiTreeItem-label:hover': {
      backgroundColor: 'none',
    },
    '& .MuiTreeItem-content': {
      width: 'auto',
      padding: '0',
      '&.Mui-focused': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(10, 206, 130, 0.28)',
      },
      '&.Mui-focused.Mui-selected': {
        backgroundColor: 'rgba(10, 206, 130, 0.28) !important',
      },

      '&:hover': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',
      },
      '& .MuiTreeItem-label': {
        background: 'none',
      },
    },
  },
  treeItem: {
    '& .MuiTreeItem-iconContainer': {
      color: '#666',
    },
    '& .right-selected-on': {
      '& .MuiTreeItem-content': {
        backgroundColor: 'rgba(10, 206, 130, 0.08)',
        '&.Mui-selected': {
          backgroundColor: 'rgba(10, 206, 130, 0.28) !important',
        },
      },
    },
  },
  collectionNode: {
    minHeight: '24px',
    lineHeight: '24px',
    position: 'relative',
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
    left: 160,
    top: 8,
    zIndex: 1,
    pointerEvents: 'none',
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
