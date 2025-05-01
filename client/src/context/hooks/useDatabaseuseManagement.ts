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
    async (updateLoading?: boolean) => {
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
    },
    [logout]
  ); // Added logout dependency

  // API: delete database
  const dropDatabase = useCallback(
    async (params: { db_name: string }) => {
      const res = await DatabaseService.dropDatabase(params);
      const newDatabases = await fetchDatabases();
      // Switch to the first available database after deletion
      if (newDatabases.length > 0) {
        setDatabase(newDatabases[0].name);
      } else {
        // Handle case where no databases are left (e.g., logout or show message)
        logout();
      }
      return res;
    },
    [fetchDatabases, logout]
  ); // Added fetchDatabases and logout dependencies

  // Effect to fetch initial databases when authenticated
  useEffect(() => {
    if (isAuth) {
      // Update database from auth context when auth state changes
      setDatabase(authReq.database);
      // Fetch databases immediately when authenticated
      fetchDatabases(true);
    } else {
      // Clear data when not authenticated
      setDatabases([]);
      setLoadingDatabases(true);
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
    dropDatabase,
  };
};
