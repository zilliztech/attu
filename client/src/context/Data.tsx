import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { authContext } from '@/context';
import { CollectionService, MilvusService } from '@/http';
import { WS_EVENTS, WS_EVENTS_TYPE, LOADING_STATE } from '@server/utils/Const';
import { DEFAULT_TREE_WIDTH } from '@/consts';
import { checkIndexing, checkLoading } from '@server/utils/Shared';
import { useUIPrefs } from '@/hooks/useUIPrefs';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDatabaseManagement } from '@/hooks/useDatabaseManagement';
import type {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/schema/Types';
import type { DataContextType } from './Types';
import type {
  CollectionObject,
  CollectionFullObject,
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
  const { clientId } = useContext(authContext);

  // UI preferences hook
  const { ui, setUIPref } = useUIPrefs();

  // Database Management Hook
  const {
    databases,
    loadingDatabases,
    database,
    setDatabase,
    fetchDatabases,
    createDatabase,
    dropDatabase,
    setDatabaseList,
  } = useDatabaseManagement();

  // local collection state
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [loading, setLoading] = useState(true);

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
        return;
      }
      detectLoadingIndexing(collections);
      setCollections(prev => {
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
    isAuth: !!clientId,
    clientId,
    database,
    onCollectionUpdate: updateCollections,
  });

  // API:fetch collections
  const fetchCollections = async () => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setCollections([]);
      const res = await CollectionService.getAllCollections();
      if (currentRequestId === requestIdRef.current) {
        detectLoadingIndexing(res);
        setCollections(res);
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
    const res = await CollectionService.getCollection(name);
    updateCollections({ collections: [res] });
    return res;
  };

  const _fetchCollections = async (collectionNames: string[]) => {
    const res = await CollectionService.getCollections({
      db_name: database,
      collections: collectionNames,
    });
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
    const newCollection = await CollectionService.createCollection(data);

    const newCollections = collections.concat(newCollection).sort((a, b) => {
      if (a.loadedPercentage === b.loadedPercentage && a.schema && b.schema) {
        if (a.schema.hasVectorIndex === b.schema.hasVectorIndex) {
          return b.createdTime - a.createdTime;
        }
        return a.schema.hasVectorIndex ? -1 : 1;
      }
      return (b.loadedPercentage || 0) - (a.loadedPercentage || 0);
    });

    setCollections(newCollections);

    return newCollection;
  };

  // API: load collection
  const loadCollection = async (name: string, param?: any) => {
    const res = await CollectionService.loadCollection(name, param);

    const collection = collections.find(
      v => v.collection_name === name
    ) as CollectionFullObject;
    if (collection) {
      collection.loadedPercentage = 0;
      collection.loaded = false;
      collection.status = LOADING_STATE.LOADING;
    }

    updateCollections({ collections: [collection] });

    return res;
  };

  // API: release collection
  const releaseCollection = async (name: string) => {
    return await CollectionService.releaseCollection(name);
  };

  // API: rename collection
  const renameCollection = async (name: string, newName: string) => {
    const newCollection = await CollectionService.renameCollection(name, {
      new_collection_name: newName,
    });
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: duplicate collection
  const duplicateCollection = async (name: string, newName: string) => {
    const newCollection = await CollectionService.duplicateCollection(name, {
      new_collection_name: newName,
    });
    setCollections(prev => [...prev, newCollection]);

    return newCollection;
  };

  // API: drop collection
  const dropCollection = async (name: string) => {
    const dropped = await CollectionService.dropCollection(name);
    if (dropped.error_code === 'Success') {
      setCollections(prev => prev.filter(v => v.collection_name !== name));
    }

    return dropped;
  };

  // API: create index
  const createIndex = async (param: IndexCreateParam) => {
    const newCollection = await CollectionService.createIndex(param);
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: drop index
  const dropIndex = async (params: IndexManageParam) => {
    const { data } = await CollectionService.dropIndex(params);
    updateCollections({ collections: [data] });

    return data;
  };

  // API: create alias
  const createAlias = async (collectionName: string, alias: string) => {
    const newCollection = await CollectionService.createAlias(collectionName, {
      alias,
    });
    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // API: drop alias
  const dropAlias = async (collectionName: string, alias: string) => {
    const { data } = await CollectionService.dropAlias(collectionName, {
      alias,
    });

    updateCollections({ collections: [data] });

    return data;
  };

  // API: set property
  const setCollectionProperty = async (
    collectionName: string,
    key: string,
    value: any
  ) => {
    const newCollection = await CollectionService.setProperty(collectionName, {
      [key]: value,
    });

    updateCollections({ collections: [newCollection] });

    return newCollection;
  };

  // Effect to fetch collections when connection is established or database changes
  useEffect(() => {
    if (connected) {
      fetchCollections();
    } else {
      setCollections([]);
      setLoading(true);
    }
  }, [connected, database]);

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
        setDatabaseList,
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
