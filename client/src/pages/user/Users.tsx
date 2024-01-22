import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import RouteTabList from '@/components/customTabList/RouteTabList';
import { ITab } from '@/components/customTabList/Types';
import User from './User';
import Roles from './Roles';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    flexDirection: 'row',
    gap: theme.spacing(4),
  },
  card: {
    boxShadow: 'none',
    flexBasis: theme.spacing(28),
    width: theme.spacing(28),
    flexGrow: 0,
    flexShrink: 0,
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'auto',
  },
}));

const Users = () => {
  const classes = useStyles();
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
  ];

  const activeTabIndex = tabs.findIndex(t => t.path === currentPath);

  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <RouteTabList
        tabs={tabs}
        wrapperClass={classes.tab}
        activeIndex={activeTabIndex}
      />
    </section>
  );
};

export default Users;
