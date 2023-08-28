import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navContext } from '@/context';
import { ALL_ROUTER_TYPES, NavInfo } from '@/router/Types';

export const useNavigationHook = (
  type: ALL_ROUTER_TYPES,
  extraParam?: {
    collectionName?: string;
    title?: string;
  }
) => {
  const { t: navTrans } = useTranslation('nav');
  const { setNavInfo } = useContext(navContext);
  const { collectionName = '', title = 'PLUGIN TITLE' } = extraParam || {
    collectionName: '',
  };

  useEffect(() => {
    switch (type) {
      case ALL_ROUTER_TYPES.OVERVIEW: {
        const navInfo: NavInfo = {
          navTitle: navTrans('overview'),
          backPath: '',
          showDatabaseSelector: true,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.DATABASES: {
        const navInfo: NavInfo = {
          navTitle: navTrans('database'),
          backPath: '',
          showDatabaseSelector: false,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.COLLECTIONS: {
        const navInfo: NavInfo = {
          navTitle: navTrans('collection'),
          backPath: '',
          showDatabaseSelector: true,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.COLLECTION_DETAIL: {
        const navInfo: NavInfo = {
          navTitle: collectionName,
          backPath: '/collections',
          showDatabaseSelector: false,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.SEARCH: {
        const navInfo: NavInfo = {
          navTitle: navTrans('search'),
          backPath: '',
          showDatabaseSelector: true,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.SYSTEM: {
        const navInfo: NavInfo = {
          navTitle: navTrans('system'),
          backPath: '',
          showDatabaseSelector: false,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.USER: {
        const navInfo: NavInfo = {
          navTitle: navTrans('user'),
          backPath: '',
          showDatabaseSelector: true,
        };
        setNavInfo(navInfo);
        break;
      }
      default:
        break;
    }
  }, [type, navTrans, setNavInfo, collectionName, title]);
};
