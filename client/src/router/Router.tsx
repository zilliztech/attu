import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { authContext } from '@/context';
import Databases from '@/pages/databases/Databases';
import Connect from '@/pages/connect/Connect';
import Users from '@/pages/user/UsersAndRoles';
import Index from '@/pages/index';
import Search from '@/pages/search/VectorSearch';
import System from '@/pages/system/SystemView';
import SystemHealthy from '@/pages/systemHealthy/SystemHealthyView';
import Play from '@/pages/play/Play';

const RouterComponent = () => {
  const { isManaged } = useContext(authContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route path="databases" element={<Databases />} />
          <Route path="databases/:databaseName" element={<Databases />} />
          <Route
            path="databases/:databaseName/:databasePage"
            element={<Databases />}
          />

          <Route
            path="databases/:databaseName/:collectionName/:collectionPage"
            element={<Databases />}
          />

          <Route path="search" element={<Search />} />
          <Route path="system_healthy" element={<SystemHealthy />} />
          {!isManaged && (
            <>
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Users />} />
              <Route path="privilege-groups" element={<Users />} />
              <Route path="system" element={<System />} />
            </>
          )}
          <Route path="play" element={<Play />} />
        </Route>
        <Route path="connect" element={<Connect />} />
      </Routes>
    </Router>
  );
};

export default RouterComponent;
