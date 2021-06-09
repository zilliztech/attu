import GlobalEffect from './GlobalEffect';
import Header from './Header';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import NavMenu from '../menu/NavMenu';
import { NavMenuItem } from '../menu/Types';
import { useContext } from 'react';
import { rootContext } from '../../context/Root';
import icons from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    content: {
      display: 'flex',
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'scroll',
    },
    activeConsole: {
      '& path': {
        fill: theme.palette.primary.main,
      },
    },
    normalConsole: {
      '& path': {
        fill: '#82838e',
      },
    },
  })
);

const Layout = (props: any) => {
  const history = useHistory();
  const { isAuth } = useContext(rootContext);
  const { t } = useTranslation('nav');
  const classes = useStyles();

  const menuItems: NavMenuItem[] = [
    {
      icon: icons.navOverview,
      label: t('overview'),
      onClick: () => history.push('/'),
    },
    {
      icon: icons.navCollection,
      label: t('collection'),
      onClick: () => history.push('/collections'),
    },
    {
      icon: icons.navConsole,
      label: t('console'),
      onClick: () => history.push('/console'),
      iconActiveClass: classes.activeConsole,
      iconNormalClass: classes.normalConsole,
    },
  ];

  return (
    <div className={classes.root}>
      <GlobalEffect>
        <div className={classes.content}>
          {isAuth && (
            <NavMenu
              width="200px"
              data={menuItems}
              defaultActive={t('overview')}
              // used for nested child menu
              defaultOpen={{ [t('overview')]: true }}
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
