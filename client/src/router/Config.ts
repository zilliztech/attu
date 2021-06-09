import Connect from '../pages/connect/Connect';
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
];

export default RouterConfig;
