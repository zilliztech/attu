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
import { checkIndexBuilding, checkLoading } from '@/utils';
import { DataContextType } from './Types';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import { LAST_TIME_DATABASE } from '@/consts';
import { CollectionObject } from '@server/types';

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
});

const { Provider } = dataContext;

export const DataProvider = (props: { children: React.ReactNode }) => {
  // local data state
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState<string>(
    window.localStorage.getItem(LAST_TIME_DATABASE) || 'default'
  );
  const [databases, setDatabases] = useState<string[]>(['default']);
  // auth context
  const { isAuth, clientId } = useContext(authContext);
  // socket ref
  const socket = useRef<Socket | null>(null);

  // socket callback
  const socketCallBack = useCallback(
    (collections: CollectionObject[]) => {
      const hasLoadingOrBuildingCollection = collections.some(
        v => checkLoading(v) || checkIndexBuilding(v)
      );

      setCollections(collections);
      // If no collection is building index or loading collection
      // stop server cron job
      if (!hasLoadingOrBuildingCollection) {
        MilvusService.triggerCron({
          name: WS_EVENTS.COLLECTION,
          type: WS_EVENTS_TYPE.STOP,
        });
      }
    },
    [database]
  );

  // http fetch collection
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await CollectionService.getCollections();
      setCollections(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

      socket.current?.on(WS_EVENTS.COLLECTION, socketCallBack);
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
      // listen to collection event
      socket.current?.on(WS_EVENTS.COLLECTION, socketCallBack);
      // get data
      fetchCollections();
    }
  }, [socketCallBack, connected]);

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
      }}
    >
      {props.children}
    </Provider>
  );
};
