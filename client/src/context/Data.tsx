import { createContext, useContext, useEffect } from 'react';
import { authContext } from '@/context';
import { DEFAULT_TREE_WIDTH } from '@/consts';
import { useUIPrefs } from '@/context/hooks/useUIPrefs';
import { useWebSocket } from '@/context/hooks/useWebSocket';
import { useDatabaseManagement } from '@/context/hooks/useDatabaseManagement';
import { useCollectionsManagement } from '@/context/hooks/useCollectionsManagement';
import type { DataContextType } from './Types';

export const dataContext = createContext<DataContextType>({
  loading: true,
  loadingDatabases: true,
  collections: [],
  setCollections: () => {},
  database: '',
  setDatabase: () => {},
  databases: [],
  fetchDatabases: async () => {},
  fetchCollections: async () => {},
  fetchCollection: async () => {},
  batchRefreshCollections: async () => {},
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

  // Database Hook
  const { databases, loadingDatabases, database, setDatabase, fetchDatabases } =
    useDatabaseManagement();

  //  useCollections hook
  const {
    collections,
    setCollections,
    loading,
    fetchCollections,
    fetchCollection,
    batchRefreshCollections,
    updateCollections,
  } = useCollectionsManagement(database);

  // WebSocket Hook
  const { connected } = useWebSocket({
    isAuth: !!clientId,
    clientId,
    database,
    onCollectionUpdate: updateCollections,
  });

  // Effect to fetch collections when connection is established or database changes
  useEffect(() => {
    if (connected) {
      fetchCollections();
    } else {
      setCollections([]);
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
        fetchCollection,
        fetchDatabases,
        fetchCollections,
        batchRefreshCollections,
        ui,
        setUIPref,
      }}
    >
      {props.children}
    </Provider>
  );
};
