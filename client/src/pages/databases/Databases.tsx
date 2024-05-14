import { useContext, useEffect, useState } from 'react';
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
import Data from './collections/data/CollectionData';
import Segments from './collections/segments/Segments';
import Search from './collections/search/Search';
import { dataContext, authContext } from '@/context';
import Collections from './collections/Collections';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { ConsistencyLevelEnum } from '@/consts';
import RefreshButton from './RefreshButton';
import CopyButton from '@/components/advancedSearch/CopyButton';
import { SearchParams } from './types';
import { CollectionObject, CollectionFullObject } from '@server/types';

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
  headerIcon: {
    marginLeft: theme.spacing(0.5),
    '& svg': {
      fontSize: 15,
      color: theme.palette.primary.main,
    },
  },
}));

// Databases page(tree and tabs)
const Databases = () => {
  // context
  const { database, collections, loading, fetchCollection } =
    useContext(dataContext);

  // UI state
  const [searchParams, setSearchParams] = useState<SearchParams[]>(
    [] as SearchParams[]
  );

  // init search params
  useEffect(() => {
    if (collections[0] && collections[0].schema) {
      const initSearchParams = (collections as CollectionFullObject[]).map(
        c => {
          return {
            collection: c,
            searchParams: c.schema.vectorFields.map(v => {
              return {
                anns_field: v.name,
                params: {},
                data: '',
                expanded: c.schema.vectorFields.length === 1,
                field: v,
                selected: c.schema.vectorFields.length === 1,
              };
            }),
            globalParams: {
              topK: 50,
              consistency_level: ConsistencyLevelEnum.Bounded,
            },
          };
        }
      );
      setSearchParams(initSearchParams);
    }
  }, [collections]);

  // get current collection from url
  const params = useParams();
  const {
    databaseName = '',
    collectionName = '',
    collectionPage = '',
  } = params;

  // get style
  const classes = useStyles();

  // update navigation
  useNavigationHook(ALL_ROUTER_TYPES.DATABASES, {
    collectionName,
    databaseName,
    extra: (
      <>
        <CopyButton
          label=""
          value={collectionName}
          className={classes.headerIcon}
        />
        <RefreshButton
          className={classes.headerIcon}
          onClick={async () => {
            await fetchCollection(collectionName);
          }}
        />
      </>
    ),
  });

  const setCollectionSearchParams = (params: SearchParams) => {
    setSearchParams(prevParams => {
      return prevParams.map(s => {
        if (
          s.collection.collection_name === params.collection.collection_name
        ) {
          return {...params};
        }
        return s;
      });
    });
  };

  // render
  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <section className={classes.tree}>
        {loading ? (
          <StatusIcon type={LoadingType.CREATING} />
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
        <DatabasesTab databaseName={databaseName} tabClass={classes.tab} />
      )}
      {collectionName && (
        <CollectionTabs
          collectionPage={collectionPage}
          collectionName={collectionName}
          tabClass={classes.tab}
          searchParams={
            searchParams.find(
              s => s.collection.collection_name === collectionName
            )!
          }
          setSearchParams={setCollectionSearchParams}
          collections={collections}
        />
      )}
    </section>
  );
};

// Database tab pages
const DatabasesTab = (props: {
  databaseName: string;
  tabClass: string; // tab class
}) => {
  const { databaseName, tabClass } = props;
  const { t: collectionTrans } = useTranslation('collection');

  const dbTab: ITab[] = [
    {
      label: collectionTrans('collections'),
      component: <Collections />,
      path: `collections`,
    },
  ];
  const actionDbTab = dbTab.findIndex(t => t.path === databaseName);
  return (
    <RouteTabList
      tabs={dbTab}
      wrapperClass={tabClass}
      activeIndex={actionDbTab !== -1 ? actionDbTab : 0}
    />
  );
};

// Collection tab pages
const CollectionTabs = (props: {
  collectionPage: string; // current collection page
  collectionName: string; // current collection name
  tabClass: string; // tab class
  collections: CollectionObject[]; // collections
  searchParams: SearchParams; // search params
  setSearchParams: (params: SearchParams) => void; // set search params
}) => {
  // props
  const {
    collectionPage,
    collectionName,
    tabClass,
    collections,
    searchParams,
    setSearchParams,
  } = props;

  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

  // context
  const { isManaged } = useContext(authContext);
  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  // collection tabs
  const collectionTabs: ITab[] = [
    {
      label: collectionTrans('overviewTab'),
      component: <Overview />,
      path: `overview`,
    },
    {
      label: collectionTrans('searchTab'),
      component: (
        <Search
          collections={collections}
          collectionName={collectionName}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      ),
      path: `search`,
    },
    {
      label: collectionTrans('dataTab'),
      component: (
        <Data collections={collections} collectionName={collectionName} />
      ),
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

  return (
    <RouteTabList
      tabs={collectionTabs}
      wrapperClass={tabClass}
      activeIndex={activeColTab !== -1 ? activeColTab : 0}
    />
  );
};

export default Databases;
