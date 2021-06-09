import GlobalEffect from './GlobalEffect';
import Header from './Header';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import NavMenu from '../menu/NavMenu';
import { NavMenuItem } from '../menu/Types';
// import { useHistory } from 'react-router';
// import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      backgroundColor: (props: any) => props.backgroundColor,
    },
    content: {
      display: 'flex',
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: `100vh`,
      overflowY: 'scroll',
    },
  })
);

const Layout = (props: any) => {
  const path = window.location.hash.slice(2);
  const greyPaths = ['', 'billing'];
  const bgColor = greyPaths.includes(path) ? '#f5f5f5' : '#fff';
  const classes = useStyles({ backgroundColor: bgColor });

  const data: NavMenuItem[] = [];
  const isAuth = false;

  return (
    <div className={classes.root}>
      <GlobalEffect>
        <div className={classes.content}>
          {isAuth && (
            <NavMenu
              width="200px"
              data={data}
              defaultActive="Lock"
              defaultOpen={{ security: true }}
            />
          )}

          <div className={classes.body}>
            {isAuth && <Header />}
            {props.children}
          </div>
        </div>
      </GlobalEffect>
    </div>
  );
};

export default Layout;
