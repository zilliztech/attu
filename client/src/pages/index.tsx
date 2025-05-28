import { useMemo, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalEffect from '@/components/layout/GlobalEffect';
import Header from '@/components/layout/Header';
import NavMenu from '@/components/menu/NavMenu';
import { NavMenuItem } from '@/components/menu/Types';
import icons from '@/components/icons/Icons';
import { authContext, rootContext, dataContext } from '@/context';
import Overview from '@/pages/home/Home';
import Box from '@mui/material/Box';

function Index() {
  const { isAuth, isManaged, isDedicated, authReq } = useContext(authContext);
  const { database } = useContext(dataContext);
  const { versionInfo } = useContext(rootContext);
  const { t: navTrans } = useTranslation('nav');
  const navigate = useNavigate();
  const location = useLocation();

  const navMap = [
    { key: 'databases', label: 'database' },
    { key: 'search', label: 'search' },
    { key: 'system', label: 'system' },
    { key: 'users', label: 'user' },
    { key: 'roles', label: 'user' },
    { key: 'privilege-groups', label: 'user' },
    { key: 'play', label: 'play' },
  ];
  const defaultActive = useMemo(() => {
    const found = navMap.find(item => location.pathname.includes(item.key));
    return navTrans(found?.label || 'overview');
  }, [location.pathname, navTrans]);

  const baseMenu: NavMenuItem[] = [
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
    {
      icon: icons.code,
      label: navTrans('play'),
      onClick: () => navigate('/play'),
    },
  ];

  const menuItems = [...baseMenu];

  if (!isManaged || isDedicated) {
    menuItems.push({
      icon: icons.navPerson,
      label: navTrans('user'),
      onClick: () => navigate('/users'),
    });
  }

  if (!isManaged) {
    menuItems.push(
      {
        icon: icons.navSystem,
        label: navTrans('system'),
        onClick: () => navigate('/system'),
      },
      {
        icon: icons.newWindow,
        label: 'Milvus WebUI',
        onClick: () => {
          window.open(
            `http://${authReq.address.split(':')[0]}:9091/webui`,
            '_blank'
          );
        },
      }
    );
  }

  if (!isAuth) {
    return <Navigate to="/connect" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme => theme.palette.background.default,
      }}
    >
      <GlobalEffect>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <NavMenu
            width="172px"
            data={menuItems}
            defaultActive={defaultActive}
            defaultOpen={{ [navTrans('overview')]: true }}
            versionInfo={versionInfo}
          />

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              overflowY: 'scroll',
            }}
          >
            <Header />
            {location.pathname === '/' ? <Overview /> : <Outlet />}
          </Box>
        </Box>
      </GlobalEffect>
    </Box>
  );
}

export default Index;
