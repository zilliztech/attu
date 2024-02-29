import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { authContext } from '@/context';
import Collection from '@/pages/collections/Collection';
import Collections from '@/pages/collections/Collections';
import Connect from '@/pages/connect/Connect';
import Users from '@/pages/user/Users';
import Database from '@/pages/database/Database';
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
          <Route index element={<Database />} />
          <Route path="db-admin" element={<Database />} />
          <Route path="collections" element={<Collections />} />
          <Route path="collections/:collectionName" element={<Collection />} />
          <Route
            path="collections/:collectionName/:tab"
            element={<Collection />}
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
