import Collection from '../pages/collections/Collection';
import Collections from '../pages/collections/Collections';
import Connect from '../pages/connect/Connect';
import Overview from '../pages/overview/Overview';
import VectorSearch from '../pages/seach/VectorSearch';
import { RouterConfigType } from './Types';
import loadable from '@loadable/component';

const PLUGIN_DEV = process.env.REACT_APP_PLUGIN_DEV;

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
];

function importAll(r: any, outOfRoot = false) {
  r.keys().forEach((key: any) => {
    const content = r(key);
    const dirName = key.split('/config.json').shift().split('/')[1];
    const pathName = content.client?.path;
    const entry = content.client?.entry;
    if (!(pathName || entry)) return;
    console.log(content);
    const auth = content.client?.auth || false;
    const OtherComponent = outOfRoot
      ? loadable(() => import(`all_plugins/${dirName}/client/${entry}`))
      : loadable(() => import(`../plugins/${dirName}/${entry}`));
    console.log(OtherComponent);
    RouterConfig.push({
      path: `/${pathName}`,
      component: OtherComponent,
      auth,
    });
  });
}
importAll(require.context('../plugins/', true, /config\.json$/));
PLUGIN_DEV &&
  importAll(require.context('all_plugins/', true, /config\.json$/), true);

export default RouterConfig;
