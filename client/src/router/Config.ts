import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Overview from '../pages/overview/Overview';
import VectorSearch from '../pages/seach/VectorSearch';
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
    path: '/collections/:collectionName',
    component: Collection,
    auth: true,
  },
  {
    path: '/search',
    component: VectorSearch,
    auth: true,
  },
  {
    path: '/search/:collectionName',
    component: VectorSearch,
    auth: true,
  },
];

export default RouterConfig;
