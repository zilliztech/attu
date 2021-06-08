import { FC } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { HeaderType } from './Types';
// import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.common.black,
      marginRight: theme.spacing(5),
    },
    contentWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing(3),
      paddingLeft: theme.spacing(6),
      flex: 1,
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
      '& svg': {
        fontSize: '16px',
        cursor: 'pointer',
      },
    },
    changePwdTip: {
      width: '420px',
      textAlign: 'center',
      '& span': {
        fontStyle: 'italic',
      },
    },
    user: {
      display: 'flex',
    },
    menuLabel: {
      height: '100%',
      color: '#010e29',
      fontSize: '14px',
      lineHeight: '20px',

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    arrow: {
      color: theme.palette.primary.main,
    },
    icon: {
      color: theme.palette.primary.main,
    },
  })
);

const Header: FC<HeaderType> = props => {
  const classes = useStyles();

  return (
    <header className={classes.header}>
      <div className={classes.contentWrapper}>header</div>
    </header>
  );
};

export default Header;
