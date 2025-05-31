import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { authContext } from '@/context';
import Connect from '@/pages/connect/Connect';
import Index from '@/pages/index';
import { getRoutes } from '@/config/routes';

const RouterComponent = () => {
  const { isManaged, isDedicated } = useContext(authContext);

  const routes = getRoutes(isManaged, isDedicated);

  const renderRoutes = (routes: any[]) => {
    return routes.map(route => {
      const Element = route.element;
      return (
        <Route key={route.path} path={route.path} element={<Element />}>
          {route.children && renderRoutes(route.children)}
        </Route>
      );
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="connect" element={<Connect />} />
        <Route path="/" element={<Index />}>
          {renderRoutes(routes)}
        </Route>
      </Routes>
    </Router>
  );
};

export default RouterComponent;
