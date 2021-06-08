import { makeStyles, Theme } from '@material-ui/core';
import { ReactElement } from 'react';
import backgroundPath from '../../assets/imgs/background.png';

const getContainerStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '100%',
    height: '90%',
    backgroundImage: `url(${backgroundPath})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '480px',
    backgroundColor: '#fff',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: theme.spacing(5, 0),
  },
}));

// used for user login process
const UserContainer = ({ children }: { children: ReactElement }) => {
  const classes = getContainerStyles();

  return (
    <section className={classes.wrapper}>
      <div className={classes.card}>{children}</div>
    </section>
  );
};

export default UserContainer;
