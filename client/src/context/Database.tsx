import { createContext, useEffect, useState } from 'react';
import { DatabaseHttp } from '@/http/Database';
import { DatabaseContextType } from './Types';

export const databaseContext = createContext<DatabaseContextType>({
  database: 'default',
  databases: ['default'],
  setDatabase: () => {},
});

const { Provider } = databaseContext;
export const DatabaseProvider = (props: { children: React.ReactNode }) => {
  // get milvus address from local storage
  const [database, setDatabase] = useState<string>('default');
  const [databases, setDatabases] = useState<string[]>(['default']);

  const fetchDatabases = async () => {
    const res = await DatabaseHttp.getDatabases();
    setDatabases(res.db_names);
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  return (
    <Provider
      value={{
        database,
        databases,
        setDatabase,
      }}
    >
      {props.children}
    </Provider>
  );
};
