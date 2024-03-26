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
import { url, CollectionService, MilvusService, DatabaseService } from '@/http';
import {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/overview/Types';
import { DataContextType } from './Types';
import {
  CollectionObject,
  CollectionFullObject,
  DatabaseObject,
} from '@server/types';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import { checkIndexing, checkLoading } from '@server/utils/Shared';

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
  loadCollection: async () => {
    return {} as CollectionFullObject;
  },
  releaseCollection: async () => {
    return {} as CollectionFullObject;
  },
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
});

const { Provider } = dataContext;

export const DataProvider = (props: { children: React.ReactNode }) => {
  // auth context
  const { authReq, isAuth, clientId, logout, setAuthReq } =
    useContext(authContext);

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

      // trigger cron if it has
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
    (updateCollections: CollectionFullObject[]) => {
      // check state to see if it is loading or building index, if so, start server cron job
      detectLoadingIndexing(updateCollections);
      // update single collection
      setCollections(prev => {
        // update exsit collection
        const newCollections = prev.map(v => {
          const collectionToUpdate = updateCollections.find(c => c.id === v.id);

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
    updateLoading && setLoadingDatabases(true);
    const newDatabases = await DatabaseService.listDatabases();
    updateLoading && setLoadingDatabases(false);

    // if no database, logout
    if (newDatabases.length === 0) {
      logout();
    }
    setDatabases(newDatabases);

    return newDatabases;
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
    updateCollections([res]);

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
    const newCollection = await CollectionService.loadCollection(name, param);
    // update collection
    updateCollections([newCollection]);

    return newCollection;
  };

  // API: release collection
  const releaseCollection = async (name: string) => {
    // release collection
    const newCollection = await CollectionService.releaseCollection(name);
    // update collection
    updateCollections([newCollection]);

    return newCollection;
  };

  // API: rename collection
  const renameCollection = async (name: string, newName: string) => {
    // rename collection
    const newCollection = await CollectionService.renameCollection(name, {
      new_collection_name: newName,
    });
    updateCollections([newCollection]);

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
    updateCollections([newCollection]);

    return newCollection;
  };

  // API: drop index
  const dropIndex = async (params: IndexManageParam) => {
    // drop index
    const { data } = await CollectionService.dropIndex(params);
    // update collection
    updateCollections([data]);

    return data;
  };

  // API: create alias
  const createAlias = async (collectionName: string, alias: string) => {
    // create alias
    const newCollection = await CollectionService.createAlias(collectionName, {
      alias,
    });
    // update collection
    updateCollections([newCollection]);

    return newCollection;
  };

  // API: drop alias
  const dropAlias = async (collectionName: string, alias: string) => {
    // drop alias
    const { data } = await CollectionService.dropAlias(collectionName, {
      alias,
    });

    // update collection
    updateCollections([data]);

    return data;
  };

  useEffect(() => {
    if (isAuth) {
      // update database get from auth
      setDatabase(authReq.database);
      // connect to socket server
      socket.current = io(url as string);
      // register client
      socket.current.emit(WS_EVENTS.REGISTER, clientId);

      socket.current.on('connect', async () => {
        console.log('--- ws connected ---', clientId);
        // fetch db
        await fetchDatabases(true);
        // set connected to trues
        setConnected(true);
      });
    } else {
      socket.current?.disconnect();
      // clear collections
      setCollections([]);
      // clear database
      setDatabases([]);
      // set connected to false
      setConnected(false);
    }
  }, [isAuth]);

  useEffect(() => {
    if (connected) {
      // clear data
      setCollections([]);
      // remove all listeners
      socket.current?.offAny();
      // listen to backend collection event
      socket.current?.on(WS_EVENTS.COLLECTION_UPDATE, updateCollections);

      // fetch db
      fetchCollections();
    }

    return () => {
      // remove all listeners when component unmount
      socket.current?.offAny();
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
      }}
    >
      {props.children}
    </Provider>
  );
};
