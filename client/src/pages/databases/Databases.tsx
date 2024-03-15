import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import RouteTabList from '@/components/customTabList/RouteTabList';
import DatabaseTree from '@/pages/databases/tree';
import { ITab } from '@/components/customTabList/Types';
import Partitions from './collections/partitions/Partitions';
import Overview from './collections/overview/Overview';
import Data from './collections/data/Data';
import Segments from './collections/segments/Segments';
import { dataContext, authContext } from '@/context';
import Collections from './collections/Collections';
import StatusIcon from '@/components/status/StatusIcon';
import { ChildrenStatusType } from '@/components/status/Types';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    flexDirection: 'row',
  },
  tree: {
    boxShadow: 'none',
    flexBasis: theme.spacing(28),
    width: theme.spacing(28),
    flexGrow: 0,
    flexShrink: 0,
    height: 'calc(100vh - 96px)',
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: theme.spacing(0, 2, 0, 0),
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'auto',
    padding: theme.spacing(0, 2),
  },
  refreshBtn: {
    minWidth: 0,
    marginLeft: 4,
    color: theme.palette.attuGrey.main,
  },
}));

const Databases = () => {
  // context
  const { isManaged } = useContext(authContext);
  const { database, collections, loading, fetchCollection } =
    useContext(dataContext);

  // get current collection from url
  const params = useParams();
  const {
    databaseName = '',
    collectionName = '',
    collectionPage = '',
  } = params;

  // icons
  const RefreshIcon = icons.refresh;

  // refresh collection
  const refreshCollection = async () => {
    await fetchCollection(collectionName);
  };

  // get style
  const classes = useStyles();

  // update navigation
  useNavigationHook(ALL_ROUTER_TYPES.DATABASES, {
    collectionName,
    databaseName,
    extra: (
      <CustomButton onClick={refreshCollection} className={classes.refreshBtn}>
        <RefreshIcon />
      </CustomButton>
    ),
  });

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
      label: collectionTrans('schemaTab'),
      component: <Overview />,
      path: `info`,
    },
    {
      label: collectionTrans('dataTab'),
      component: <Data />,
      path: `data`,
    },
    {
      label: collectionTrans('partitionTab'),
      component: <Partitions />,
      path: `partitions`,
    },
  ];

  if (!isManaged) {
    collectionTabs.push({
      label: collectionTrans('segmentsTab'),
      component: <Segments />,
      path: `segments`,
    });
  }

  // get active collection tab
  const activeColTab = collectionTabs.findIndex(t => t.path === collectionPage);

  // render
  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <section className={classes.tree}>
        {loading ? (
          <StatusIcon type={ChildrenStatusType.CREATING} />
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
