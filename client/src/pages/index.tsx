import { useMemo, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalEffect from '@/components/layout/GlobalEffect';
import Header from '@/components/layout/Header';
import NavMenu from '@/components/menu/NavMenu';
import { authContext, rootContext, dataContext } from '@/context';
import Overview from '@/pages/home/Home';
import Box from '@mui/material/Box';
import { getMenuItems } from '@/config/routes';

function Index() {
  const { isAuth, isManaged, isDedicated, authReq } = useContext(authContext);
  const { database } = useContext(dataContext);
  const { versionInfo } = useContext(rootContext);
  const { t: navTrans } = useTranslation('nav');
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItems(
    isManaged,
    isDedicated,
    database,
    navTrans,
    navigate,
    authReq
  );

  const defaultActive = useMemo(() => {
    const path = location.pathname.split('/')[1] || 'overview';
    const menuItem = menuItems.find(item => item.key === path);
    return menuItem?.label || navTrans('overview');
  }, [location.pathname, menuItems, navTrans]);

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
