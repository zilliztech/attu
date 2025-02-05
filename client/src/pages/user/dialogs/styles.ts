import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useDBCollectionSelectorStyle = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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
  },
  categoryBody: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  privilegeTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: theme.palette.text.primary,
    margin: 0,
    marginLeft: theme.spacing(-2),
  },
  privileges: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: 'auto',
    minHeight: 300,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
  },

  selectAllCheckbox: {
    marginLeft: theme.spacing(1),
  },
  checkbox: {
    padding: theme.spacing(1),
  },
}));
