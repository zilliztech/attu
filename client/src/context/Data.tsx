import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { authContext } from '@/context';
import {
  CollectionService,
  MilvusService,
  DatabaseService,
} from '@/http';
import { WS_EVENTS, WS_EVENTS_TYPE, LOADING_STATE } from '@server/utils/Const';
import { DEFAULT_TREE_WIDTH } from '@/consts';
import { checkIndexing, checkLoading } from '@server/utils/Shared';
import { useUIPrefs } from '@/hooks/useUIPrefs';
import { useWebSocket } from '@/hooks/useWebSocket';
import type {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/schema/Types';
import type { DataContextType } from './Types';
import type {
  CollectionObject,
  CollectionFullObject,
  DatabaseObject,
  ResStatus,
} from '@server/types';

export const dataContext = createContext<DataContextType>({
  loading: true,
  loadingDatabases: true,
  collections: [],
  setCollections: () => {},
  database: '',
  setDatabase: () => {},
  databases: [],
  setDatabaseList: () => {},
  createDatabase: async () => ({}) as ResStatus,
  dropDatabase: async () => ({}) as ResStatus,
  fetchDatabases: async () => {
    return [];
  },
  fetchCollections: async () => {},
  fetchCollection: async () => {
    return {} as CollectionFullObject;
  },
  batchRefreshCollections: async () => {},
  createCollection: async () => {
    return {} as CollectionFullObject;
  },
  loadCollection: async () => ({}) as ResStatus,
  releaseCollection: async () => ({}) as ResStatus,
  renameCollection: async () => {
    return {} as CollectionFullObject;
  },
  duplicateCollection: async () => {
    return {} as CollectionFullObject;
  },
  dropCollection: async () => {
    return {
      error_code: -1,
      reason: '',
    };
  },
  createIndex: async () => {
    return {} as CollectionFullObject;
  },
  dropIndex: async () => {
    return {} as CollectionFullObject;
  },
  createAlias: async () => {
    return {} as CollectionFullObject;
  },
  dropAlias: async () => {
    return {} as CollectionFullObject;
  },
  setCollectionProperty: async () => {
    return {} as CollectionFullObject;
  },
  ui: {
    tree: {
      width: DEFAULT_TREE_WIDTH,
    },
  },
  setUIPref: () => {},
});

const { Provider } = dataContext;

export const DataProvider = (props: { children: React.ReactNode }) => {
  // auth context
  const { authReq, isAuth, clientId, logout, setAuthReq } =
    useContext(authContext);

  // UI preferences hook
  const { ui, setUIPref } = useUIPrefs();

  // local data state
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [database, setDatabase] = useState<string>(authReq.database);
  const [databases, setDatabases] = useState<DatabaseObject[]>([]);

  // Use a ref to track concurrent requests
  const requestIdRef = useRef(0);

  // collection state test
  const detectLoadingIndexing = useCallback(
    (collections: CollectionObject[]) => {
      const LoadingOrBuildingCollections = collections.filter(v => {
        const isLoading = checkLoading(v);
        const isBuildingIndex = checkIndexing(v);

        return isLoading || isBuildingIndex;
      });

      // trigger cron if it has to
      if (LoadingOrBuildingCollections.length > 0) {
        MilvusService.triggerCron({
          name: WS_EVENTS.COLLECTION_UPDATE,
          type: WS_EVENTS_TYPE.START,
          payload: {
            database,
            collections: LoadingOrBuildingCollections.map(
              c => c.collection_name
            ),
          },
        });
      }
    },
    [database]
  );

  // Websocket Callback: update single collection
  const updateCollections = useCallback(
    (props: { collections: CollectionFullObject[]; database?: string }) => {
      const { collections = [], database: remote } = props;
      if (
        remote !== database &&
        database !== undefined &&
        remote !== undefined
      ) {
        // console.log('database not matched', remote, database);
        return;
      }
      // check state to see if it is loading or building index, if so, start server cron job
      detectLoadingIndexing(collections);
      // update single collection
      setCollections(prev => {
        // update exist collection
        const newCollections = prev.map(v => {
          const collectionToUpdate = collections.find(c => c.id === v.id);

          if (collectionToUpdate) {
            return collectionToUpdate;
          }

          return v;
        });

        return newCollections;
      });
    },
    [database, detectLoadingIndexing]
  );

  // WebSocket Hook
  const { connected } = useWebSocket({
    isAuth,
    clientId,
    database, // Pass database
    onCollectionUpdate: updateCollections,
  });

  // API: fetch databases
  const fetchDatabases = async (updateLoading?: boolean) => {
    try {
      updateLoading && setLoadingDatabases(true);
      const newDatabases = await DatabaseService.listDatabases();
      // if no database, logout
      if (newDatabases.length === 0) {
        logout();
      }
      setDatabases(newDatabases);

      return newDatabases;
    } finally {
      updateLoading && setLoadingDatabases(false);
    }
  };

  // API: create database
  const createDatabase = async (params: { db_name: string }) => {
    const res = await DatabaseService.createDatabase(params);
    await fetchDatabases();

    return res;
  };

  // API: delete database
  const dropDatabase = async (params: { db_name: string }) => {
    const res = await DatabaseService.dropDatabase(params);
    const newDatabases = await fetchDatabases();

    setDatabase(newDatabases[0].name);

    return res;
  };

  // API:fetch collections
  const fetchCollections = async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      // set loading true
      setLoading(true);
      // set collections
      setCollections([]);
      // fetch collections
      const res = await CollectionService.getAllCollections();
      // Only process the response if this is the latest request
      if (currentRequestId === requestIdRef.current) {
        // check state
        detectLoadingIndexing(res);
        // set collections
        setCollections(res);
        // set loading false
        setLoading(false);
      }
    } catch (error) {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
      throw error;
    }
  };

  // API: fetch single collection
  const fetchCollection = async (name: string) => {
    // fetch collections
    const res = await CollectionService.getCollection(name);

    // update collection
    updateCollections({ collections: [res] });

    return res;
  };

  const _fetchCollections = async (collectionNames: string[]) => {
    const res = await CollectionService.getCollections({
      db_name: database,
      collections: collectionNames,
    });
    // update collections
    updateCollections({ collections: res });
  };

  // Batch refresh collections with debounce
  const refreshCollectionsDebounceMapRef = useRef<
    Map<
      string,
      { timer: NodeJS.Timeout | null; names: string[]; pending: Set<string> }
    >
  >(new Map());

  const batchRefreshCollections = useCallback(
    (collectionNames: string[], key: string = 'default') => {
      let ref = refreshCollectionsDebounceMapRef.current.get(key);
      if (!ref) {
        ref = { timer: null, names: [], pending: new Set() };
        refreshCollectionsDebounceMapRef.current.set(key, ref);
      }

      const filteredCollectionNames = collectionNames.filter(name => {
        const collection = collections.find(v => v.collection_name === name);
        return collection && !collection.schema && !ref!.pending.has(name);
      });

      ref.names = filteredCollectionNames;

      if (ref.timer) {
        clearTimeout(ref.timer);
      }

      function getRandomBatchSize() {
        const weights = [2, 2, 2, 3, 3, 3, 4, 4, 5];
        return weights[Math.floor(Math.random() * weights.length)];
      }

      ref.timer = setTimeout(async () => {
        if (ref!.names.length === 0) return;
        try {
          while (ref!.names.length > 0) {
            const batchSize = getRandomBatchSize();
            let batch = ref!.names.slice(0, batchSize);

            // recheck if the collection is still pending
            batch = batch.filter(name => {
              const collection = collections.find(
                v => v.collection_name === name
              );
              return collection && !collection.schema;
            });

            batch.forEach(name => ref!.pending.add(name));
            await _fetchCollections(batch);
            batch.forEach(name => ref!.pending.delete(name));
            ref!.names = ref!.names.slice(batch.length);
          }
        } catch (error) {
          console.error('Failed to refresh collections:', error);
        }
        ref!.names = [];
        ref!.timer = null;
      }, 200);
    },
    [collections, _fetchCollections]
  );

  // API: create collection
  const createCollection = async (data: any) => {
    // create collection
    const newCollection = await CollectionService.createCollection(data);

    // combine new collection with old collections
    // sort state by createdTime.
    const newCollections = collections.concat(newCollection).sort((a, b) => {
      if (a.loadedPercentage === b.loadedPercentage && a.schema && b.schema) {
        if (a.schema.hasVectorIndex === b.schema.hasVectorIndex) {
          return b.createdTime - a.createdTime;
        }
        return a.schema.hasVectorIndex ? -1 : 1;
      }
      return (b.loadedPercentage || 0) - (a.loadedPercentage || 0);
    });

    // update collection
    setCollections(newCollections);

    return newCollection;
  };

  // API: load collection
  const loadCollection = async (name: string, param?: any) => {
    // load collection
    const res = await CollectionService.loadCollection(name, param);

    // find the collection in the collections
    const collection = collections.find(
      v => v.collection_name === name
    ) as CollectionFullObject;
    // update collection infomation
    if (collection) {
      collection.loadedPercentage = 0;
      collection.loaded = false;
      collection.status = LOADING_STATE.LOADING;
    }

    // update collection, and trigger cron job
    updateCollections({ collections: [collection] });

    return res;
  };

  // API: release collection
  const releaseCollection = async (name: string) => {
    // release collection
    return await CollectionService.releaseCollection(name);
  };

  // API: rename collection
  const renameCollection = async (name: string, newName: string) => {
    // rename collection
    const newCollection = await CollectionService.renameCollection(name, {
      new_collection_name: newName,
    });
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: duplicate collection
  const duplicateCollection = async (name: string, newName: string) => {
    // duplicate collection
    const newCollection = await CollectionService.duplicateCollection(name, {
      new_collection_name: newName,
    });
    // inset collection to state
    setCollections(prev => [...prev, newCollection]);

    return newCollection;
  };

  // API: drop collection
  const dropCollection = async (name: string) => {
    // drop collection
    const dropped = await CollectionService.dropCollection(name);
    if (dropped.error_code === 'Success') {
      // remove collection from state
      setCollections(prev => prev.filter(v => v.collection_name !== name));
    }

    return dropped;
  };

  // API: create index
  const createIndex = async (param: IndexCreateParam) => {
    // create index
    const newCollection = await CollectionService.createIndex(param);
    // update collection
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: drop index
  const dropIndex = async (params: IndexManageParam) => {
    // drop index
    const { data } = await CollectionService.dropIndex(params);
    // update collection
    updateCollections({ collections: [data] });

    return data;
  };

  // API: create alias
  const createAlias = async (collectionName: string, alias: string) => {
    // create alias
    const newCollection = await CollectionService.createAlias(collectionName, {
      alias,
    });
    // update collection
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: drop alias
  const dropAlias = async (collectionName: string, alias: string) => {
    // drop alias
    const { data } = await CollectionService.dropAlias(collectionName, {
      alias,
    });

    // update collection
    updateCollections({ collections: [data] });

    return data;
  };

  // API: set property
  const setCollectionProperty = async (
    collectionName: string,
    key: string,
    value: any
  ) => {
    // set property
    const newCollection = await CollectionService.setProperty(collectionName, {
      [key]: value,
    });

    // update existing collection
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // Effect to fetch initial data when authenticated and connected
  useEffect(() => {
    if (isAuth) {
      // Update database from auth context when auth state changes
      setDatabase(authReq.database);
      // Fetch databases immediately when authenticated
      // The useWebSocket hook handles the connection itself
      fetchDatabases(true);
    } else {
      // Clear data when not authenticated
      setCollections([]);
      setDatabases([]);
      setLoading(true); // Reset loading states if needed
      setLoadingDatabases(true);
    }
  }, [isAuth, authReq.database]);

  // Effect to fetch collections when connection is established or database changes
  useEffect(() => {
    if (connected) {
      // Fetch collections when connected or database changes
      fetchCollections();
    } else {
      // Clear collections if disconnected
      setCollections([]);
      setLoading(true); // Optionally reset loading state
    }
  }, [connected, database]);

  // Effect to update auth context when local database state changes
  useEffect(() => {
    // Only update if the database actually changed from the auth context one
    if (authReq.database !== database) {
      setAuthReq({ ...authReq, database });
    }
  }, [database, authReq, setAuthReq]);

  return (
    <Provider
      value={{
        loading,
        loadingDatabases,
        collections,
        setCollections,
        database,
        databases,
        setDatabase,
        setDatabaseList: setDatabases,
        createDatabase,
        dropDatabase,
        fetchDatabases,
        fetchCollections,
        fetchCollection,
        batchRefreshCollections,
        createCollection,
        loadCollection,
        releaseCollection,
        renameCollection,
        duplicateCollection,
        dropCollection,
        createIndex,
        dropIndex,
        createAlias,
        dropAlias,
        setCollectionProperty,
        ui,
        setUIPref,
      }}
    >
      {props.children}
    </Provider>
  );
};
