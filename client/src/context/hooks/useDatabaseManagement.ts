import { useState, useEffect, useContext, useCallback } from 'react';
import { DatabaseService } from '@/http';
import { authContext } from '@/context';
import type { DatabaseObject } from '@server/types';

export const useDatabaseManagement = () => {
  const { authReq, isAuth, logout, setAuthReq } = useContext(authContext);

  const [databases, setDatabases] = useState<DatabaseObject[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [database, setDatabase] = useState<string>(authReq.database);

  // API: fetch databases
  const fetchDatabases = useCallback(
    async (updateLoading?: boolean): Promise<void> => {
      try {
        updateLoading && setLoadingDatabases(true);
        const newDatabases = await DatabaseService.listDatabases();
        if (newDatabases.length === 0) {
          logout();
          return;
        }
        setDatabases(newDatabases);

        setDatabase(prev =>
          newDatabases.some(db => db.name === prev)
            ? prev
            : newDatabases[0].name
        );
      } catch (error) {
        console.error('Failed to fetch databases:', error);
      } finally {
        updateLoading && setLoadingDatabases(false);
      }
    },
    [logout]
  );

  // Effect to fetch initial databases when authenticated
  useEffect(() => {
    if (isAuth) {
      if (database !== authReq.database) setDatabase(authReq.database);
      fetchDatabases(true);
    } else {
      // Clear data when not authenticated
      setDatabases([]);
      setLoadingDatabases(false);
    }
  }, [isAuth, authReq.database, fetchDatabases]); // Added fetchDatabases dependency

  // Effect to update auth context when local database state changes
  useEffect(() => {
    // Only update if the database actually changed from the auth context one
    if (authReq.database !== database) {
      setAuthReq({ ...authReq, database });
    }
  }, [database, authReq, setAuthReq]);

  return {
    databases,
    loadingDatabases,
    database,
    setDatabase,
    fetchDatabases,
  };
};
