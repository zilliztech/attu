import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navContext } from '@/context';
import { NavInfo } from '@/router/Types';
import { ALL_ROUTER_TYPES } from '@/router/consts';

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
  const { collectionName = '', extra } = extraParam || {};

  useEffect(() => {
    const baseNavInfo: Omit<NavInfo, 'navTitle'> = {
      backPath: '',
      showDatabaseSelector: false,
    };

    const navConfigMap: Record<ALL_ROUTER_TYPES, () => NavInfo | undefined> = {
      [ALL_ROUTER_TYPES.HOME]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('welcome'),
      }),

      [ALL_ROUTER_TYPES.DATABASES]: () => ({
        ...baseNavInfo,
        navTitle: collectionName,
        showDatabaseSelector: true,
        ...(collectionName ? { extra } : {}),
      }),

      [ALL_ROUTER_TYPES.COLLECTIONS]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('collections'),
        showDatabaseSelector: true,
      }),

      [ALL_ROUTER_TYPES.COLLECTION_DETAIL]: () => ({
        ...baseNavInfo,
        navTitle: collectionName || navTrans('collection'),
        showDatabaseSelector: true,
        ...(collectionName ? { extra } : {}),
      }),

      [ALL_ROUTER_TYPES.SEARCH]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('search'),
        showDatabaseSelector: true,
      }),

      [ALL_ROUTER_TYPES.SYSTEM]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('system'),
      }),

      [ALL_ROUTER_TYPES.USER]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('user'),
      }),

      [ALL_ROUTER_TYPES.DB_ADMIN]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('dbAdmin'),
        showDatabaseSelector: true,
      }),

      [ALL_ROUTER_TYPES.PLAY]: () => ({
        ...baseNavInfo,
        navTitle: navTrans('play'),
      }),
    };

    const getNavInfo = Object.prototype.hasOwnProperty.call(navConfigMap, type)
      ? navConfigMap[type as ALL_ROUTER_TYPES]
      : navConfigMap[ALL_ROUTER_TYPES.HOME];
    const navInfo = getNavInfo();

    if (navInfo) {
      setNavInfo(navInfo);
    }
  }, [type, navTrans, setNavInfo, collectionName, extra]);
};
