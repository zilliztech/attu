import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navContext } from '@/context';
import { NavInfo } from '@/router/Types';
import { routes, mergeNavConfig, RoutePath } from '@/config/routes';

export const useNavigationHook = (
  type: RoutePath,
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
    const route = routes.find(r => r.routerType === type);
    if (!route) {
      return;
    }

    const navConfig = mergeNavConfig(route.navConfig);
    const navInfo: NavInfo = {
      backPath: navConfig.backPath || '',
      showDatabaseSelector: navConfig.showDatabaseSelector || false,
      navTitle: navConfig.useCollectionNameAsTitle
        ? collectionName || navTrans(navConfig.navTitleKey || '')
        : navTrans(navConfig.navTitleKey || ''),
      ...(collectionName ? { extra } : {}),
    };

    setNavInfo(navInfo);
  }, [type, navTrans, setNavInfo, collectionName, extra]);
};
