import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Overview from '../pages/overview/Overview';
// import VectorSearch from '../pages/seach/VectorSearch';
import { RouterConfigType } from './Types';
import loadable from '@loadable/component';
import Users from '../pages/user/User';
import Code from '../pages/code/Code';

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
    path: '/code',
    component: Code,
    auth: true,
  },
  {
    path: '/collections/:collectionName',
    component: Collection,
    auth: true,
  },
  { path: '/users', component: Users, auth: true },
];

async function importAll(r: any) {
  Object.keys(r).forEach((key: any) => {
    const content = r[key];
    const dirName = key.split('/config.json').shift().split('/')[1];
    const pathName = content.client?.path;
    const fileEntry = content.client?.entry;
    if (!pathName || !fileEntry) return;
    const auth = content.client?.auth || false;
    const OtherComponent = loadable(
      () => import(`../${dirName}/${pathName}/${fileEntry}.tsx`)
    );
    RouterConfig.push({
      path: `/${pathName}`,
      component: OtherComponent,
      auth,
    });
  });
}

const pluginConfigs = import.meta.glob(`../plugins/**/config.json`, {
  eager: true,
});
importAll(pluginConfigs);

export default RouterConfig;
