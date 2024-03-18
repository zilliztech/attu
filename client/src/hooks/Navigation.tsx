import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navContext } from '@/context';
import { ALL_ROUTER_TYPES, NavInfo } from '@/router/Types';

export const useNavigationHook = (
  type: ALL_ROUTER_TYPES,
  extraParam?: {
    databaseName?: string;
    collectionName?: string;
    title?: string;
    extra?: React.ReactNode;
  }
) => {
  const { t: navTrans } = useTranslation('nav');
  const { setNavInfo } = useContext(navContext);
  const {
    databaseName = '',
    collectionName = '',
    extra,
  } = extraParam || {
    collectionName: '',
    databaseName: '',
  };

  useEffect(() => {
    switch (type) {
      case ALL_ROUTER_TYPES.HOME: {
        const navInfo: NavInfo = {
          navTitle: navTrans('welcome'),
          backPath: '',
          showDatabaseSelector: false,
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.DATABASES: {
        const navInfo: NavInfo = {
          navTitle: collectionName,
          backPath: '',
          showDatabaseSelector: true,
        };

        if (collectionName) {
          navInfo.extra = extra;
        }

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
  }, [type, navTrans, setNavInfo, databaseName, collectionName]);
};
