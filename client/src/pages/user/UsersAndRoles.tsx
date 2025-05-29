import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import RouteTabList from '@/components/customTabList/RouteTabList';
import User from './User';
import Roles from './Roles';
import PrivilegeGroups from './PrivilegeGroups';
import Box from '@mui/material/Box';
import type { ITab } from '@/components/customTabList/Types';

const Users = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);

  const location = useLocation();
  const currentPath = location.pathname.slice(1);

  const { t: userTrans } = useTranslation('user');

  const tabs: ITab[] = [
    {
      label: userTrans('users'),
      component: <User />,
      path: 'users',
    },
    {
      label: userTrans('roles'),
      component: <Roles />,
      path: 'roles',
    },
    {
      label: userTrans('privilegeGroups'),
      component: <PrivilegeGroups />,
      path: 'privilege-groups',
    },
  ];

  const activeTabIndex = tabs.findIndex(t => t.path === currentPath);

  return (
    <Box
      component="section"
      className="page-wrapper"
      sx={theme => ({
        display: 'flex',
        flexDirection: 'row',
        background: theme.palette.background.paper,
        padding: theme.spacing(0.5, 1.5),
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <RouteTabList tabs={tabs} activeIndex={activeTabIndex} />
    </Box>
  );
};

export default Users;
