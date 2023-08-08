import { makeStyles, Theme } from '@material-ui/core';

export const getVectorSearchStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',
    justifyContent: 'space-between',

    '& .field': {
      display: 'flex',
      flexDirection: 'column',
      width: 250,
      padding: theme.spacing(2),
      backgroundColor: '#fff',
      borderRadius: theme.spacing(0.5),
      boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',

      '& .textarea': {
        border: `1px solid ${theme.palette.attuGrey.main}`,
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(0.5, 1),
        marginBottom: theme.spacing(1),
        overflow: 'scroll',
        height: '120px',
      },
    },

    '& .field-second': {
      flexGrow: 1,
      flexBasis: '50%',
      margin: theme.spacing(0, 1),
    },

    // Textfield component has more bottom space to show error msg when validation
    // if still set padding-bottom, the whole form space will be stretched
    '& .field-params': {
      paddingBottom: 0,
      width: 390,
    },

    '& .text': {
      color: theme.palette.attuGrey.dark,
      fontWeight: 500,
      marginBottom: theme.spacing(1),
      height: theme.spacing(4),
      '& button': {
        marginLeft: '8px',
        position: 'relative',
        top: -5,
        verticalAlign: 'top',
      },
    },
  },
  selector: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  paramsWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    padding: theme.spacing(2, 0),

    '& .left': {
      display: 'flex',
      alignItems: 'center',

      '& .text': {
        color: theme.palette.attuGrey.main,
      },
    },
    '& .right': {
      '& .btn': {
        marginRight: theme.spacing(1),
      },
      '& .icon': {
        fontSize: '16px',
      },
    },
  },
  menuLabel: {
    minWidth: '108px',

    padding: theme.spacing(0, 1),
    margin: theme.spacing(0, 1),

    backgroundColor: '#fff',
    color: theme.palette.attuGrey.dark,
  },
  menuItem: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuGrey.dark,
  },
  error: {
    color: theme.palette.error.main,
  },
}));
