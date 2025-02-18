import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { authContext } from '@/context';
import {
  CollectionService,
  MilvusService,
  DatabaseService,
  isElectron,
  url,
} from '@/http';
import { WS_EVENTS, WS_EVENTS_TYPE, LOADING_STATE } from '@server/utils/Const';
import { DEFAULT_TREE_WIDTH, ATTU_UI_TREE_WIDTH } from '@/consts';
import { checkIndexing, checkLoading } from '@server/utils/Shared';
import type {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/schema/Types';
import type { DataContextType } from './Types';
import type {
  CollectionObject,
  CollectionFullObject,
  DatabaseObject,
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
  createDatabase: async () => {},
  dropDatabase: async () => {},
  fetchDatabases: async () => {
    return [];
  },
  fetchCollections: async () => {},
  fetchCollection: async () => {
    return {} as CollectionFullObject;
  },
  createCollection: async () => {
    return {} as CollectionFullObject;
  },
  loadCollection: async () => {},
  releaseCollection: async () => {},
  renameCollection: async () => {
    return {} as CollectionFullObject;
  },
  duplicateCollection: async () => {
    return {} as CollectionFullObject;
  },
  dropCollection: async () => {},
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

  // UI preferences
  const [ui, setUI] = useState({
    tree: {
      width: DEFAULT_TREE_WIDTH,
    },
  });

  // local data state
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [database, setDatabase] = useState<string>(authReq.database);

  const [databases, setDatabases] = useState<DatabaseObject[]>([]);
  // socket ref
  const socket = useRef<Socket | null>(null);

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
      const { collections, database: remote } = props;
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
    [database]
  );

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
    await DatabaseService.createDatabase(params);
    await fetchDatabases();
  };

  // API: delete database
  const dropDatabase = async (params: { db_name: string }) => {
    await DatabaseService.dropDatabase(params);
    const newDatabases = await fetchDatabases();

    setDatabase(newDatabases[0].name);
  };

  // API:fetch collections
  const fetchCollections = async () => {
    try {
      // set loading true
      setLoading(true);
      // set collections
      setCollections([]);
      // fetch collections
      const res = await CollectionService.getCollections();
      // check state
      detectLoadingIndexing(res);
      // set collections
      setCollections(res);
      // set loading false
      setLoading(false);
    } finally {
      setLoading(false);
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
    await CollectionService.loadCollection(name, param);

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
  };

  // API: release collection
  const releaseCollection = async (name: string) => {
    // release collection
    await CollectionService.releaseCollection(name);
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
    if (dropped.data.error_code === 'Success') {
      // remove collection from state
      setCollections(prev => prev.filter(v => v.collection_name !== name));
    }
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

  // set UI preferences
  const setUIPref = (pref: DataContextType['ui']) => {
    setUI(pref);
    localStorage.setItem(ATTU_UI_TREE_WIDTH, String(pref.tree.width));
  };

  // load UI preferences
  useEffect(() => {
    const storedWidth = Number(localStorage.getItem(ATTU_UI_TREE_WIDTH));
    if (storedWidth) {
      setUI(prevUI => ({
        ...prevUI,
        tree: {
          ...prevUI.tree,
          width: storedWidth,
        },
      }));
    }
  }, []);

  useEffect(() => {
    const clear = () => {
      // clear collections
      setCollections([]);
      // clear database
      setDatabases([]);
      // set connected to false
      setConnected(false);
      // remove all listeners when component unmount
      socket.current?.offAny();
      socket.current?.disconnect();
    };

    if (isAuth) {
      // update database get from auth
      setDatabase(authReq.database);

      const extraHeaders = {
        'milvus-client-id': clientId,
      };

      const ioParams = { extraHeaders, query: extraHeaders };

      socket.current = isElectron ? io(url as string, ioParams) : io(ioParams);

      socket.current.on('connect', async () => {
        // console.info('--- ws connected ---', clientId);
        // fetch db
        await fetchDatabases(true);
        // set connected to trues
        setConnected(true);
      });

      // handle disconnect
      socket.current.on('disconnect', () => {
        // Set connected to false
        setConnected(false);
      });

      // handle error
      socket.current.on('error', error => {
        socket.current?.disconnect();
      });
    } else {
      clear();
    }

    return () => {
      clear();
    };
  }, [isAuth]);

  useEffect(() => {
    if (connected) {
      // clear data
      setCollections([]);
      // remove all listeners
      socket.current?.off(WS_EVENTS.COLLECTION_UPDATE, updateCollections);
      // listen to backend collection event
      socket.current?.on(WS_EVENTS.COLLECTION_UPDATE, updateCollections);

      // fetch db
      fetchCollections();
    }

    return () => {
      socket.current?.off(WS_EVENTS.COLLECTION_UPDATE, updateCollections);
    };
  }, [updateCollections, connected]);

  useEffect(() => {
    setAuthReq({ ...authReq, database });
  }, [database]);

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
