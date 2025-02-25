import { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigationHook } from '@/hooks';
import DatabaseTree from '@/pages/databases/tree';
import { dataContext } from '@/context';
import StatusIcon from '@/components/status/StatusIcon';
import { ConsistencyLevelEnum, DYNAMIC_FIELD } from '@/consts';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { makeStyles } from '@mui/styles';
import { LoadingType } from '@/components/status/StatusIcon';
import type { Theme } from '@mui/material/styles';
import type { SearchParams, QueryState } from './types';
import { DatabasesTab } from './DatabasesTab';
import { CollectionsTabs } from './CollectionsTab';

const DEFAULT_TREE_WIDTH = 230;

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    flexDirection: 'row',
    padding: theme.spacing(0),
    '&.dragging': {
      cursor: 'ew-resize',
      '& $tree': {
        pointerEvents: 'none',
        userSelect: 'none',
      },
      '& $tab': {
        pointerEvents: 'none',
        userSelect: 'none',
      },
      '& $dragger': {
        background: theme.palette.divider,
      },
    },
  },
  tree: {
    boxShadow: 'none',
    flexGrow: 0,
    flexShrink: 0,
    height: 'calc(100vh - 90px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    paddingRight: 8,
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
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    overflowX: 'auto',
    padding: theme.spacing(0, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.1)',
  },
}));

// Databases page(tree and tabs)
const Databases = () => {
  // context
  const { database, collections, loading, ui, setUIPref } =
    useContext(dataContext);

  // UI state
  const [searchParams, setSearchParams] = useState<SearchParams[]>([]);
  const [queryState, setQueryState] = useState<QueryState[]>([]);

  // tree ref
  const [isDragging, setIsDragging] = useState(false);
  const treeRef = useRef<HTMLDivElement>(null);
  const draggerRef = useRef<HTMLDivElement>(null);

  // support dragging tree width
  useEffect(() => {
    // local tree width
    let treeWidth = 0;
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        // get mouse position
        let mouseX = e.clientX - treeRef.current!.offsetLeft;

        // set min and max width
        treeWidth = Math.max(1, Math.min(mouseX, DEFAULT_TREE_WIDTH));

        // set tree width
        setUIPref({ tree: { width: treeWidth } });
        setIsDragging(true);
      });
    };

    const handleMouseUp = () => {
      // set dragging false
      setIsDragging(false);
      // highlight dragger alwasy if width === 1
      draggerRef.current!.classList.toggle('tree-collapsed', treeWidth === 1);
      document.removeEventListener('mousemove', handleMouseMove);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const t = e.target as HTMLDivElement;
      if (t && t.dataset.id === 'dragger') {
        // set dragging true
        setIsDragging(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.stopPropagation();
      }
    };

    // add event listener
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      // remove event listener
      document.removeEventListener('mousedown', handleMouseDown);
      // set dragging false
      setIsDragging(false);
    };
  }, [isDragging]);

  // double click on the dragger, recover default
  const handleDoubleClick = () => {
    draggerRef.current!.classList.toggle('tree-collapsed', false);
    setUIPref({ tree: { width: DEFAULT_TREE_WIDTH } });
  };

  // init search params and query state
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
              partitions: [],
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
                topK: 15,
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
              graphData: { nodes: [], links: [] },
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

      // find query state for the collection
      const query = queryState.find(
        q => q.collection.collection_name === c.collection_name
      );

      // if query state not found, and the schema is ready, create new query state
      if (!query && c.schema) {
        setQueryState(prevState => {
          const fields = [...c.schema.fields, ...c.schema.dynamicFields].filter(
            f => !f.is_function_output
          );
          return [
            ...prevState,
            {
              collection: c,
              expr: '',
              fields: fields,
              outputFields: fields.map(f => f.name),
              consistencyLevel: ConsistencyLevelEnum.Bounded,
              tick: 0,
            },
          ];
        });
      } else {
        // update collection
        setQueryState(prevState => {
          return prevState.map(q => {
            if (q.collection.collection_name === c.collection_name) {
              // update collection
              const collection = c;
              return { ...q, collection };
            }
            return q;
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

    // delete query state for the collection that is not in the collections
    setQueryState(prevState => {
      return prevState.filter(q =>
        collections.find(
          c => c.collection_name === q.collection.collection_name
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
    databasePage = '',
  } = params;

  // get style
  const classes = useStyles();

  // update navigation
  useNavigationHook(ALL_ROUTER_TYPES.DATABASES, {
    collectionName,
    databaseName,
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

  const setCollectionQueryState = (state: QueryState) => {
    setQueryState(prevState => {
      return prevState.map(q => {
        if (q.collection.collection_name === state.collection.collection_name) {
          return { ...state };
        }
        return q;
      });
    });
  };

  // render
  return (
    <section
      className={`page-wrapper ${classes.wrapper} ${
        isDragging ? 'dragging' : ''
      }`}
    >
      <section
        className={classes.tree}
        ref={treeRef}
        style={{ width: ui.tree.width }}
      >
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
        <DatabasesTab
          databasePage={databasePage}
          databaseName={databaseName}
          tabClass={classes.tab}
        />
      )}
      {collectionName && (
        <CollectionsTabs
          collectionPage={collectionPage}
          collectionName={collectionName}
          tabClass={classes.tab}
          searchParams={
            searchParams.find(
              s => s.collection.collection_name === collectionName
            )!
          }
          setSearchParams={setCollectionSearchParams}
          queryState={
            queryState.find(
              q => q.collection.collection_name === collectionName
            )!
          }
          setQueryState={setCollectionQueryState}
          collections={collections}
        />
      )}
    </section>
  );
};

export default Databases;
