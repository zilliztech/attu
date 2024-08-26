import { useMemo, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Theme } from '@mui/material';
import GlobalEffect from '@/components/layout/GlobalEffect';
import Header from '@/components/layout/Header';
import NavMenu from '@/components/menu/NavMenu';
import { NavMenuItem } from '@/components/menu/Types';
import icons from '@/components/icons/Icons';
import {
  authContext,
  rootContext,
  prometheusContext,
  dataContext,
} from '@/context';
import Overview from '@/pages/home/Home';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    display: 'flex',

    '& .active': {
      '& path': {
        fill: theme.palette.text.primary,
      },
    },

    '& .normal': {
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
}));

function Index() {
  const navigate = useNavigate();
  const { isAuth, isManaged } = useContext(authContext);
  const { isPrometheusReady } = useContext(prometheusContext);
  const { database } = useContext(dataContext);
  const { versionInfo } = useContext(rootContext);
  const { t: navTrans } = useTranslation('nav');
  const classes = useStyles();
  const location = useLocation();
  const isIndex = location.pathname === '/';
  const defaultActive = useMemo(() => {
    if (location.pathname.includes('databases')) {
      return navTrans('database');
    }

    if (location.pathname.includes('search')) {
      return navTrans('search');
    }

    if (location.pathname.includes('system')) {
      return navTrans('system');
    }

    if (
      location.pathname.includes('users') ||
      location.pathname.includes('roles')
    ) {
      return navTrans('user');
    }

    return navTrans('overview');
  }, [location, navTrans]);

  const menuItems: NavMenuItem[] = [
    {
      icon: icons.attu,
      label: navTrans('overview'),
      onClick: () => navigate('/'),
    },
    {
      icon: icons.database,
      label: navTrans('database'),
      onClick: () => navigate(`/databases/${database}/collections`),
    },
    // {
    //   icon: icons.navSearch,
    //   label: navTrans('search'),
    //   onClick: () => navigate('/search'),
    // },
  ];

  if (!isManaged) {
    menuItems.push(
      {
        icon: icons.navPerson,
        label: navTrans('user'),
        onClick: () => navigate('/users'),
      },
      {
        icon: icons.navSystem,
        label: navTrans('system'),
        onClick: () =>
          isPrometheusReady ? navigate('/system_healthy') : navigate('/system'),
      }
    );
  }

  // check if is connected
  if (!isAuth) {
    return <Navigate to="/connect" />;
  }

  return (
    <>
      <div className={classes.root}>
        <GlobalEffect>
          <div className={classes.content}>
            <NavMenu
              width="172px"
              data={menuItems}
              defaultActive={defaultActive}
              // used for nested child menu
              defaultOpen={{ [navTrans('overview')]: true }}
              versionInfo={versionInfo}
            />

            <div className={classes.body}>
              <Header />
              {isIndex ? <Overview /> : <Outlet />}
            </div>
          </div>
        </GlobalEffect>
      </div>
    </>
  );
}

export default Index;
