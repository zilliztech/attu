import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Overview from '../pages/overview/Overview';
import { RouterConfigType } from './Types';

const RouterConfig: RouterConfigType[] = [
  {
    path: '/',
    component: Overview,
    auth: true,
  },
  {
    path: '/connect',
    component: Connect,
    auth: false,
  },
  {
    path: '/collections',
    component: Collections,
    auth: true,
  },
  {
    path: '/collection/:collectionName',
    component: Collection,
    auth: true,
  },
];

export default RouterConfig;
