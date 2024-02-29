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
import { url, Collection, MilvusService, Database } from '@/http';
import { checkIndexBuilding, checkLoading } from '@/utils';
import { DataContextType } from './Types';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import { LAST_TIME_DATABASE } from '@/consts';

export const dataContext = createContext<DataContextType>({
  loading: false,
  collections: [],
  setCollections: () => {},
  database: 'default',
  setDatabase: () => {},
  databases: [],
  setDatabaseList: () => {},
});

const { Provider } = dataContext;

export const DataProvider = (props: { children: React.ReactNode }) => {
  // local data state
  const [collections, setCollections] = useState<Collection[]>([]);
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
    (data: any) => {
      const collections: Collection[] = data.map((v: any) => new Collection(v));

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
  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await Collection.getCollections();
      setCollections(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabase = async () => {
    const res = await Database.getDatabases();
    setDatabases(res.db_names);
  };

  useEffect(() => {
    if (isAuth) {
      // fetch db
      fetchDatabase();
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
      fetchCollection();
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
      }}
    >
      {props.children}
    </Provider>
  );
};