import { useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigationHook } from '@/hooks/Navigation';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CustomTabList from '@/components/customTabList/CustomTabList';
import { ITab } from '@/components/customTabList/Types';
import { parseLocationSearch } from '@/utils/Format';
import User from './User';
import Roles from './Roles';
import { TAB_EMUM } from './Types';

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

  const navigate = useNavigate();
  const location = useLocation();

  const { t: userTrans } = useTranslation('user');

  const activeTabIndex = useMemo(() => {
    const { activeIndex } = location.search
      ? parseLocationSearch(location.search)
      : { activeIndex: TAB_EMUM.schema };
    return Number(activeIndex);
  }, [location]);

  const handleTabChange = (activeIndex: number) => {
    const path = location.pathname;
    navigate(`${path}?activeIndex=${activeIndex}`);
  };

  const tabs: ITab[] = [
    {
      label: userTrans('users'),
      component: <User />,
    },
    {
      label: userTrans('roles'),
      component: <Roles />,
    },
  ];

  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <CustomTabList
        tabs={tabs}
        wrapperClass={classes.tab}
        activeIndex={activeTabIndex}
        handleTabChange={handleTabChange}
      />
    </section>
  );
};

export default Users;
