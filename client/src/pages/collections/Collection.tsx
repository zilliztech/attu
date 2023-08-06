import { useMemo, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { authContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CustomTabList from '@/components/customTabList/CustomTabList';
import { ITab } from '@/components/customTabList/Types';
import Partitions from '../partitions/Partitions';
import { parseLocationSearch } from '@/utils/Format';
import Schema from '../schema/Schema';
import Query from '../query/Query';
import Preview from '../preview/Preview';
import { TAB_ENUM } from './Types';

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

const Collection = () => {
  const classes = useStyles();
  const { isManaged } = useContext(authContext);

  const { collectionName = '' } = useParams<{
    collectionName: string;
  }>();

  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });

  const navigate = useNavigate();
  const location = useLocation();

  const { t: collectionTrans } = useTranslation('collection');

  const activeTabIndex = useMemo(() => {
    const { activeIndex } = location.search
      ? parseLocationSearch(location.search)
      : { activeIndex: TAB_ENUM.schema };
    return Number(activeIndex);
  }, [location]);

  const handleTabChange = (activeIndex: number) => {
    const path = location.pathname;
    navigate(`${path}?activeIndex=${activeIndex}`);
  };

  const tabs: ITab[] = [
    {
      label: collectionTrans('schemaTab'),
      component: <Schema collectionName={collectionName} />,
    },
    {
      label: collectionTrans('partitionTab'),
      component: <Partitions collectionName={collectionName} />,
    },
    {
      label: collectionTrans('previewTab'),
      component: <Preview collectionName={collectionName} />,
    },
    {
      label: collectionTrans('queryTab'),
      component: <Query collectionName={collectionName} />,
    },
  ];

  // exclude parititon on cloud
  if (isManaged) {
    tabs.splice(1, 1);
  }

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

export default Collection;
