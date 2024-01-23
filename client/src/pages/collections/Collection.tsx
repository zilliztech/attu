import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { authContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import RouteTabList from '@/components/customTabList/RouteTabList';
import { ITab } from '@/components/customTabList/Types';
import Partitions from '../partitions/Partitions';
import Schema from '../schema/Schema';
import Query from '../query/Query';
import Segments from '../segments/Segments';

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

  const { collectionName = '', tab = '' } = useParams<{
    collectionName: string;
    tab: string;
  }>();

  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });

  const { t: collectionTrans } = useTranslation('collection');

  const tabs: ITab[] = [
    {
      label: collectionTrans('schemaTab'),
      component: <Schema />,
      path: `schema`,
    },
    {
      label: collectionTrans('partitionTab'),
      component: <Partitions />,
      path: `partitions`,
    },
    {
      label: collectionTrans('queryTab'),
      component: <Query />,
      path: `query`,
    },
    {
      label: collectionTrans('segmentsTab'),
      component: <Segments />,
      path: `segments`,
    },
  ];

  // exclude parititon on cloud
  if (isManaged) {
    tabs.splice(1, 1);
  }

  const activeTab = tabs.findIndex(t => t.path === tab);

  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <RouteTabList
        tabs={tabs}
        wrapperClass={classes.tab}
        activeIndex={activeTab !== -1 ? activeTab : 0}
      />
    </section>
  );
};

export default Collection;
