import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: `100%`,
    overflow: 'auto',
    '& h5': {
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(0.5),
      fontSize: 13,
      fontWeight: 400,
    },
    '& h6': {
      fontSize: 14,
      lineHeight: '20px',
      display: 'flex',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.5),

      '& p': {
        margin: 0,
        marginRight: 8,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: 140,
        fontWeight: 700,
      },
    },
  },
  infoWrapper: {
    marginBottom: theme.spacing(1.5),
    paddingTop: theme.spacing(0.5),
  },
  cardWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > div:not(:last-child)': { marginRight: theme.spacing(1.5) },
    height: 200,
  },
  card: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
    padding: theme.spacing(1.5, 2),
    boxSizing: 'border-box',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'calc(33.333% - 12px)',
    height: '100%',
    minWidth: 200,
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
  extraBtn: {
    position: 'relative',
    top: -6,
    '& svg': {
      width: 15,
      color: theme.palette.text.primary,
    },
  },

  questionIcon: {
    width: 12,
    position: 'relative',
    top: '6px',
    right: '-2px',
  },
  primaryKeyChip: {
    fontSize: '8px',
    position: 'relative',
    top: '3px',
    color: 'grey',
  },
  chip: {
    fontSize: '12px',
    color: theme.palette.text.primary,
    border: 'none',
  },
  featureChip: {
    marginRight: 4,
    border: 'none',
  },
  nameWrapper: {
    display: 'flex',
    alignItems: 'center',

    '& .key': {
      width: '16px',
      height: '16px',
      marginLeft: theme.spacing(0.5),
    },
  },

  paramWrapper: {
    // set min width to prevent other table cell stretching
    minWidth: 180,

    '& .param': {
      marginRight: theme.spacing(2),

      '& .key': {
        color: theme.palette.text.secondary,
        display: 'inline-block',
        marginRight: theme.spacing(0.5),
      },

      '& .value': {
        color: theme.palette.text.primary,
      },
    },
  },

  gridWrapper: {
    paddingBottom: theme.spacing(2),
  },
}));
