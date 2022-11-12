import { makeStyles, Theme } from '@material-ui/core';

export const getVectorSearchStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',
    justifyContent: 'space-between',

    '& .field': {
      display: 'flex',
      flexDirection: 'column',
      flexBasis: '33%',

      padding: theme.spacing(2, 3, 4),
      backgroundColor: '#fff',
      borderRadius: theme.spacing(0.5),
      boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',

      '& .textarea': {
        border: `1px solid ${theme.palette.attuGrey.main}`,
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(1),
        paddingBottom: '18px',
        marginTop: theme.spacing(2),
      },

      // reset default style
      '& .textfield': {
        padding: 0,
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,

        '&::before': {
          borderBottom: 'none',
        },

        '&::after': {
          borderBottom: 'none',
        },
      },

      '& .multiline': {
        '& textarea': {
          overflow: 'auto',
          // change scrollbar style
          '&::-webkit-scrollbar': {
            width: '8px',
          },

          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f9f9f9',
          },

          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            backgroundColor: '#eee',
          },
        },
      },
    },

    '& .field-second': {
      flexGrow: 1,
      margin: theme.spacing(0, 1),
    },

    // Textfield component has more bottom space to show error msg when validation
    // if still set padding-bottom, the whole form space will be stretched
    '& .field-params': {
      paddingBottom: 0,
    },

    '& .text': {
      color: theme.palette.attuGrey.dark,
      fontWeight: 500,
    },
  },
  selector: {
    width: '100%',
    marginTop: theme.spacing(2),
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
    marginTop: theme.spacing(1),
    color: theme.palette.error.main,
  },
}));
