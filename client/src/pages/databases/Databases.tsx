import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import RouteTabList from '@/components/customTabList/RouteTabList';
import CustomTree, {
  CustomTreeItem,
  TreeNodeType,
} from '@/components/CustomTree';
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
    maxHeight: 'calc(100% - 105px)', // header + margin
  },
  tree: {
    boxShadow: 'none',
    flexBasis: theme.spacing(28),
    width: theme.spacing(28),
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'auto',
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'auto',
  },
}));

const Databases = () => {
  // UI stats
  const [localLoading, setLoading] = useState(false);
  const [collectionsTree, setCollectionsTree] = useState<CustomTreeItem>({
    id: '',
    name: '',
    type: 'db',
    children: [],
  });
  const [selectedTarget, setSelectedTarget] = useState<string[]>();

  // get current collection from url
  const {
    databaseItem = '',
    databaseName = '',
    collectionName = '',
    collectionItem = '',
  } = useParams();
  // get navigate
  const navigate = useNavigate();
  // update navigation
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });
  // get style
  const classes = useStyles();
  // get global data
  const { database, collections, loading } = useContext(dataContext);

  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  // fetch data callback
  const refresh = useCallback(async () => {
    try {
      // set UI loading
      setLoading(true);

      // format tree data
      const children = collections.map(c => {
        return {
          id: c.collection_name,
          name: c.collection_name,
          type: 'collection' as TreeNodeType,
        };
      });
      // update tree
      setCollectionsTree({
        id: database,
        name: database,
        expanded: children.length > 0,
        type: 'db',
        children: children,
      });
    } finally {
      setLoading(false);
    }
  }, [setCollectionsTree, database, collections]);

  // const onNodeToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
  //   console.log('onNodeToggle', event, nodeIds);
  // };

  const onNodeClick = (node: CustomTreeItem) => {
    navigate(
      node.type === 'db'
        ? `/databases/${database}/${databaseItem || 'collections'}`
        : `/databases/${database}/${node.id}/${collectionItem || 'data'}`
    );
  };

  // change database should go to it's page
  const firstRender = useRef(false);

  // change database should go to it's page
  useEffect(() => {
    if (firstRender.current) {
      navigate(`/databases/${database}/${databaseItem || 'collections'}`);
    } else {
      firstRender.current = true;
    }
  }, [database]);

  // fetch data
  useEffect(() => {
    refresh();
  }, [refresh]);

  // active default selected
  useEffect(() => {
    setSelectedTarget(
      collectionName ? [collectionName] : [databaseName || database]
    );
  }, [collectionName, database, databaseName]);

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
  const activeColTab = collectionTabs.findIndex(t => t.path === collectionItem);

  // render
  const uiLoading = localLoading || loading;
  return (
    <section className={`page-wrapper ${classes.wrapper}`}>
      <section className={classes.tree}>
        {uiLoading ? (
          `loading`
        ) : (
          <CustomTree
            key="collections"
            data={collectionsTree}
            defaultSelected={selectedTarget}
            onNodeClick={onNodeClick}
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
