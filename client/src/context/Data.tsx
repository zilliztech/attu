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
import { checkIndexBuilding, checkLoading, getDbValueFromUrl } from '@/utils';
import { DataContextType } from './Types';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import { LAST_TIME_DATABASE } from '@/consts';
import { CollectionObject, CollectionFullObject } from '@server/types';

export const dataContext = createContext<DataContextType>({
  loading: false,
  collections: [],
  setCollections: () => {},
  database: 'default',
  setDatabase: () => {},
  databases: [],
  setDatabaseList: () => {},
  fetchDatabases: async () => {},
  fetchCollections: async () => {},
  fetchCollection: async () => {
    return {} as CollectionFullObject;
  },
});

const { Provider } = dataContext;

export const DataProvider = (props: { children: React.ReactNode }) => {
  // get database name from url
  const currentUrl = window.location.href;
  const initialDatabase = getDbValueFromUrl(currentUrl);
  // local data state
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState<string>(
    initialDatabase ||
      window.localStorage.getItem(LAST_TIME_DATABASE) ||
      'default'
  );
  const [databases, setDatabases] = useState<string[]>([database]);
  // auth context
  const { isAuth, clientId } = useContext(authContext);
  // socket ref
  const socket = useRef<Socket | null>(null);

  // collection state test
  const checkCollectionState = useCallback(
    (collections: CollectionObject[]) => {
      const LoadingOrBuildingCollections = collections.filter(v => {
        const isLoading = checkLoading(v);
        const isBuildingIndex = checkIndexBuilding(v);

        return isLoading || isBuildingIndex;
      });
      // If no collection is building index or loading collection
      // stop server cron job

      console.log('LoadingOrBuildingCollections', LoadingOrBuildingCollections);

      MilvusService.triggerCron({
        name: WS_EVENTS.COLLECTION_UPDATE,
        type:
          LoadingOrBuildingCollections.length > 0
            ? WS_EVENTS_TYPE.START
            : WS_EVENTS_TYPE.STOP,
        payload: LoadingOrBuildingCollections.map(c => c.collection_name),
      });
    },
    []
  );

  // get all collections callback, refresh all
  const updateCollections = useCallback(
    (collections: CollectionObject[]) => {
      // check state
      checkCollectionState(collections);
      // update collections
      setCollections(collections);
    },
    [database]
  );

  // get collection callback, refresh partial
  const updateCollection = useCallback(
    (collections: CollectionObject[]) => {
      // check state
      checkCollectionState(collections);
      // update single collection
      setCollections(prev => {
        const newCollections = prev.map(v => {
          const newCollection = collections.find(c => c.id === v.id);

          if (newCollection) {
            console.log('update', newCollection);

            return newCollection;
          }

          return v;
        });

        return newCollections;
      });
    },
    [database]
  );

  // fetch collections api
  const fetchCollections = async () => {
    try {
      // set loading true
      setLoading(true);
      // fetch collections
      const res = await CollectionService.getCollections();
      // check state
      checkCollectionState(res);
      // set collections
      setCollections(res);
      // set loading false
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // fetch collection api
  const fetchCollection = async (name: string) => {
    // fetch collections
    const res = await CollectionService.getCollection(name);

    // update collection
    updateCollection([res]);

    return res;
  };

  const fetchDatabases = async () => {
    const res = await DatabaseService.getDatabases();

    setDatabases(res.db_names);
  };

  useEffect(() => {
    if (isAuth) {
      // fetch db
      fetchDatabases();
      // connect to socket server
      socket.current = io(url as string);
      // register client
      socket.current.emit(WS_EVENTS.REGISTER, clientId);

      socket.current.on('connect', function () {
        console.log('--- ws connected ---', clientId);
        setConnected(true);
      });
    } else {
      socket.current?.disconnect();
      // clear collections
      setCollections([]);
      // clear database
      setDatabases(['default']);
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
      socket.current?.on(WS_EVENTS.COLLECTIONS, updateCollections);
      socket.current?.on(WS_EVENTS.COLLECTION_UPDATE, updateCollection);

      // get data at first time
      fetchCollections();
    }

    return () => {
      // remove all listeners when component unmount
      socket.current?.offAny();
    };
  }, [updateCollections, updateCollection, connected]);

  return (
    <Provider
      value={{
        loading,
        collections,
        setCollections,
        database,
        databases,
        setDatabase,
        setDatabaseList: setDatabases,
        fetchDatabases,
        fetchCollections,
        fetchCollection,
      }}
    >
      {props.children}
    </Provider>
  );
};
