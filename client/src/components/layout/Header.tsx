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
  })
);

const Header: FC<HeaderType> = props => {
  const classes = useStyles();

  return <header className={classes.header}>header</header>;
};

export default Header;
