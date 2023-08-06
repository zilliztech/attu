import { createHashRouter, RouterProvider } from 'react-router-dom';
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

const routeObj = [
  {
    path: '/',
    element: <Index />,
    children: [
      {
        path: '/databases',
        element: <Database />,
      },
      {
        path: '/collections',
        element: <Collections />,
      },
      {
        path: '/collections/:collectionName',
        element: <Collection />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/system_healthy',
        element: <SystemHealthy />,
      },
    ],
  },
  { path: '/connect', element: <Connect /> },
];

const Router = () => {
  const { isManaged } = useContext(authContext);

  if (!isManaged) {
    routeObj[0].children?.push(
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/system',
        element: <System />,
      }
    );
  }

  const router = createHashRouter(routeObj);

  return <RouterProvider router={router}></RouterProvider>;
};
export default Router;
