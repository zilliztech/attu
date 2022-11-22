import {
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Users from '../pages/user/User';
import Index from '../pages/index';
import Search from '../pages/search/VectorSearch';
import System from '../pages/system/SystemView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    children: [
      {
        path: '/collections',
        element: <Collections />,
      },
      {
        path: '/collections/:collectionName',
        element: <Collection />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/system',
        element: <System />,
      },
    ],
  },
  { path: '/connect', element: <Connect /> },
]);

const Router = () => {
  return <RouterProvider router={router}></RouterProvider>;
};
export default Router;
