import { createContext, useContext, useEffect } from 'react';
import { authContext } from '@/context';
import { DEFAULT_TREE_WIDTH } from '@/consts';
import { useUIPrefs } from '@/context/hooks/useUIPrefs';
import { useWebSocket } from '@/context/hooks/useWebSocket';
import { useDatabaseManagement } from '@/context/hooks/useDatabaseuseManagement';
import { useCollectionsManagement } from '@/context/hooks/useCollectionsManagement';
import type { DataContextType } from './Types';
import type { CollectionFullObject, ResStatus } from '@server/types';

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

  // Database Hook
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

  //  useCollections hook
  const {
    collections,
    setCollections,
    loading,
    fetchCollections,
    fetchCollection,
    batchRefreshCollections,
    createCollection,
    loadCollection,
    releaseCollection,
    duplicateCollection,
    dropCollection,
    createIndex,
    dropIndex,
    createAlias,
    dropAlias,
    setCollectionProperty,
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
