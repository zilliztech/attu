import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import RouteTabList from '@/components/customTabList/RouteTabList';
import DatabaseTree from '@/pages/databases/tree';
import { ITab } from '@/components/customTabList/Types';
import Partitions from '../partitions/Partitions';
import Schema from '../schema/Schema';
import Query from '../query/Query';
import Segments from '../segments/Segments';
import { dataContext } from '@/context';
import Collections from '../collections/Collections';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
  tree: {
    boxShadow: 'none',
    flexBasis: theme.spacing(28),
    width: theme.spacing(28),
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'auto',
  },
}));

const Databases = () => {
  // get current collection from url
  const params = useParams();
  const {
    databaseName = '',
    collectionName = '',
    collectionPage = '',
  } = params;

  // update navigation
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });
  // get style
  const classes = useStyles();
  // get global data
  const { database, collections, loading } = useContext(dataContext);

  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  const dbTab: ITab[] = [
    {
      label: collectionTrans('collections'),
      component: <Collections />,
      path: `collections`,
    },
  ];
  const actionDbTab = dbTab.findIndex(t => t.path === databaseName);

  // collection tabs
  const collectionTabs: ITab[] = [
    {
      label: collectionTrans('dataTab'),
      component: <Query />,
      path: `data`,
    },
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
      label: collectionTrans('segmentsTab'),
      component: <Segments />,
      path: `segments`,
    },
  ];
  // get active collection tab
  const activeColTab = collectionTabs.findIndex(t => t.path === collectionPage);

  // render
  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <section className={classes.tree}>
        {loading ? (
          `loading`
        ) : (
          <DatabaseTree
            key="collections"
            collections={collections}
            database={database}
            params={params}
          />
        )}
      </section>
      {!collectionName && (
        <RouteTabList
          tabs={dbTab}
          wrapperClass={classes.tab}
          activeIndex={actionDbTab !== -1 ? actionDbTab : 0}
        />
      )}
      {collectionName && (
        <RouteTabList
          tabs={collectionTabs}
          wrapperClass={classes.tab}
          activeIndex={activeColTab !== -1 ? activeColTab : 0}
        />
      )}
    </section>
  );
};

export default Databases;
