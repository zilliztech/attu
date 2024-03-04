import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { authContext } from '@/context';
import Databases from '@/pages/databases/Databases';
import Connect from '@/pages/connect/Connect';
import Users from '@/pages/user/Users';
import DatabaseAdmin from '@/pages/dbAdmin/Database';
import Index from '@/pages/index';
import Search from '@/pages/search/VectorSearch';
import System from '@/pages/system/SystemView';
import SystemHealthy from '@/pages/systemHealthy/SystemHealthyView';

const RouterComponent = () => {
  const { isManaged } = useContext(authContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route index element={<Databases />} />
          <Route path="db-admin" element={<DatabaseAdmin />} />

          <Route path="databases" element={<Databases />} />
          <Route path="databases/:databaseName" element={<Databases />} />
          <Route
            path="databases/:databaseName/:databaseItem"
            element={<Databases />}
          />

          <Route
            path="databases/:databaseName/:collectionName/:collectionItem"
            element={<Databases />}
          />

          <Route path="search" element={<Search />} />
          <Route path="system_healthy" element={<SystemHealthy />} />
          {!isManaged && (
            <>
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Users />} />
              <Route path="system" element={<System />} />
            </>
          )}
        </Route>
        <Route path="connect" element={<Connect />} />
      </Routes>
    </Router>
  );
};

export default RouterComponent;
