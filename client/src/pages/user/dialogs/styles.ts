import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useDBCollectionSelectorStyle = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  dbCollections: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
  },
  selectorDB: {
    flex: 1,
    marginBottom: theme.spacing(2),
  },
  selectorCollection: {
    flex: 1,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    marginBottom: 0,
    '& .MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },
  categoryBody: {
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  privilegeTitle: {
    fontWeight: 600,
    fontSize: 14,
    color: theme.palette.text.primary,
    margin: 0,
    marginLeft: theme.spacing(-2),
  },
  privileges: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: 'auto',
    minHeight: 200,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  },

  privilegeBody: {
    minWidth: 200,
  },

  selectAllCheckbox: {
    marginLeft: 8,
  },
  checkbox: {},
  toggle: {
    fontSize: 13,
    '& .toggle-label': {
      padding: 0,
      marginRight: theme.spacing(1),
      fontWeight: '400',
    },
    '& .MuiRadio-root': {
      paddingRight: 8,
    },
  },
}));
