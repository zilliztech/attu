import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Console from '../pages/console/Console';
import Overview from '../pages/overview/Overview';

const RouterConfig = [
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
    path: '/console',
    component: Console,
    auth: true,
  },
];

export default RouterConfig;
