import GlobalEffect from './GlobalEffect';
import Header from './Header';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import NavMenu from '../menu/NavMenu';
import { NavMenuItem } from '../menu/Types';
import { useContext, useMemo } from 'react';
import icons from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { authContext } from '../../context/Auth';
import { IconsType } from '../icons/Types';

const PLUGIN_DEV = process.env?.REACT_APP_PLUGIN_DEV;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    content: {
      display: 'flex',

      '& .normalSearchIcon': {
        '& path': {
          fill: theme.palette.milvusGrey.dark,
        },
      },

      '& .activeSearchIcon': {
        '& path': {
          fill: theme.palette.primary.main,
        },
      },
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'scroll',
    },
  })
);

const Layout = (props: any) => {
  const history = useHistory();
  const { isAuth } = useContext(authContext);
  const { t: navTrans } = useTranslation('nav');
  const classes = useStyles();
  const location = useLocation();
  const defaultActive = useMemo(() => {
    if (location.pathname.includes('collection')) {
      return navTrans('collection');
    }

    if (location.pathname.includes('search')) {
      return navTrans('search');
    }

    if (location.pathname.includes('system')) {
      return navTrans('system');
    }

    return navTrans('overview');
  }, [location, navTrans]);

  const menuItems: NavMenuItem[] = [
    {
      icon: icons.navOverview,
      label: navTrans('overview'),
      onClick: () => history.push('/'),
    },
    // {
    //   icon: icons.navSystem,
    //   label: navTrans('system'),
    //   onClick: () => history.push('/system'),
    // },
    {
      icon: icons.navCollection,
      label: navTrans('collection'),
      onClick: () => history.push('/collections'),
    },
    {
      icon: icons.navSearch,
      label: navTrans('search'),
      onClick: () => history.push('/search'),
      iconActiveClass: 'activeSearchIcon',
      iconNormalClass: 'normalSearchIcon',
    },
  ];

  function importAll(r: any) {
    r.keys().forEach((key: any) => {
      const content = r(key);
      const pathName = content.client?.path;
      if (!pathName) return;
      const result: NavMenuItem = {
        icon: icons.navOverview,
        label: content.client?.label || 'PLGUIN',
      };
      result.onClick = () => history.push(`${pathName}`);
      const iconName: IconsType = content.client?.iconName;
      if (iconName) {
        // TODO: support custom icon
        result.icon = icons[iconName];
      }
      content.client?.iconActiveClass &&
        (result.iconActiveClass = content.client?.iconActiveClass);
      content.client?.iconNormalClass &&
        (result.iconNormalClass = content.client?.iconNormalClass);
      menuItems.push(result);
    });
  }
  importAll(require.context('../../plugins', true, /config\.json$/));
  PLUGIN_DEV &&
    importAll(require.context('all_plugins/', true, /config\.json$/));

  return (
    <div className={classes.root}>
      <GlobalEffect>
        <div className={classes.content}>
          {isAuth && (
            <NavMenu
              width="200px"
              data={menuItems}
              defaultActive={defaultActive}
              // used for nested child menu
              defaultOpen={{ [navTrans('overview')]: true }}
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
