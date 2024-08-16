import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 0,
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    '& .MuiTab-root': {
      textTransform: 'capitalize',
    },
  },
  tab: {
    height: theme.spacing(0.5),
  },
  tabContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  tabContent: {
    minWidth: 0,
    marginRight: theme.spacing(3),
  },
  tabPanel: {
    flexBasis: 0,
    flexGrow: 1,
    marginTop: theme.spacing(1),
    overflow: 'hidden',
  },
}));
