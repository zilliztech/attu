import { useContext, useEffect, useState, useRef } from 'react';
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
import Properties from './collections/properties/Properties';
import Search from './collections/search/Search';
import { dataContext, authContext } from '@/context';
import Collections from './collections/Collections';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { ConsistencyLevelEnum, DYNAMIC_FIELD } from '@/consts';
import RefreshButton from './RefreshButton';
import CopyButton from '@/components/advancedSearch/CopyButton';
import { SearchParams } from './types';
import { CollectionObject, CollectionFullObject } from '@server/types';

const DEFAULT_TREE_WIDTH = 230;

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    flexDirection: 'row',
  },
  tree: {
    boxShadow: 'none',
    flexGrow: 0,
    flexShrink: 0,
    height: 'calc(100vh - 90px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    padding: 0,
    position: 'relative',
  },
  dragger: {
    pointerEvents: 'auto',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 2,
    height: '100%',
    background: 'transparent',
    cursor: 'ew-resize',
    '&:hover': {
      width: 2,
      cursor: 'ew-resize',
      background: theme.palette.divider,
    },
    '&.tree-collapsed': {
      background: theme.palette.divider,
    },
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

  // tree ref
  const treeRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isDragging = false;
    let treeWidth = 0;
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        // get mouse position
        let mouseX = e.clientX - treeRef.current!.offsetLeft;

        treeWidth = Math.max(1, Math.min(mouseX, DEFAULT_TREE_WIDTH));

        // set tree width
        treeRef.current!.style.width = `${treeWidth}px`;
        draggerRef.current!.classList.toggle('tree-collapsed', true);
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      draggerRef.current!.classList.toggle('tree-collapsed', treeWidth === 1);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLDivElement;
      if (t && t.dataset.id === 'dragger') {
        isDragging = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // double click on the dragger, recover default
  const handleDoubleClick = () => {
    treeRef.current!.style.width = `${DEFAULT_TREE_WIDTH}px`;
    draggerRef.current!.classList.toggle('tree-collapsed', false);
  };

  // init search params
  useEffect(() => {
    collections.forEach(c => {
      // find search params for the collection
      const searchParam = searchParams.find(
        s => s.collection.collection_name === c.collection_name
      );

      // if search params not found, and the schema is ready, create new search params
      if (!searchParam && c.schema) {
        setSearchParams(prevParams => {
          const scalarFields = c.schema.scalarFields.map(s => s.name);

          return [
            ...prevParams,
            {
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
                filter: '',
                rerank: 'rrf',
                rrfParams: { k: 60 },
                weightedParams: {
                  weights: Array(c.schema.vectorFields.length).fill(0.5),
                },
                output_fields: c.schema.enable_dynamic_field
                  ? [...scalarFields, DYNAMIC_FIELD]
                  : scalarFields,
              },
              searchResult: null,
              searchLatency: 0,
            },
          ];
        });
      } else {
        // update collection
        setSearchParams(prevParams => {
          return prevParams.map(s => {
            if (s.collection.collection_name === c.collection_name) {
              // update field in search params
              const searchParams = s.searchParams.map(sp => {
                const field = c.schema?.vectorFields.find(
                  v => v.name === sp.anns_field
                );
                if (field) {
                  return { ...sp, field };
                }
                return sp;
              });
              // update collection
              const collection = c;
              return { ...s, searchParams, collection };
            }
            return s;
          });
        });
      }
    });

    // delete search params for the collection that is not in the collections
    setSearchParams(prevParams => {
      return prevParams.filter(s =>
        collections.find(
          c => c.collection_name === s.collection.collection_name
        )
      );
    });
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
          return { ...params };
        }
        return s;
      });
    });
  };

  // render
  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <section className={classes.tree} ref={treeRef}>
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
        <div
          className={classes.dragger}
          data-id="dragger"
          onDoubleClick={handleDoubleClick}
          ref={draggerRef}
        ></div>
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

  // context
  const { isManaged } = useContext(authContext);
  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

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
    collectionTabs.push(
      {
        label: collectionTrans('segmentsTab'),
        component: <Segments />,
        path: `segments`,
      },
      {
        label: collectionTrans('propertiesTab'),
        component: <Properties collection={collection} />,
        path: `properties`,
      }
    );
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
