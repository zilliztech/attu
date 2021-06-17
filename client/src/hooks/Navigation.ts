import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { useParams } from 'react-router-dom';
import { navContext } from '../context/Navigation';
import { ALL_ROUTER_TYPES, NavInfo } from '../router/Types';

export const useNavigationHook = (
  type: ALL_ROUTER_TYPES,
  extraParam?: {
    collectionName: string;
  }
) => {
  const { t } = useTranslation('nav');
  const { setNavInfo } = useContext(navContext);
  const { collectionName } = extraParam || { collectionName: '' };

  useEffect(() => {
    switch (type) {
      case ALL_ROUTER_TYPES.OVERVIEW: {
        const navInfo: NavInfo = {
          navTitle: t('overview'),
          backPath: '',
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.COLLECTIONS: {
        const navInfo: NavInfo = {
          navTitle: t('collection'),
          backPath: '',
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.COLLECTION_DETAIL: {
        const navInfo: NavInfo = {
          navTitle: collectionName,
          backPath: '/collections',
        };
        setNavInfo(navInfo);
        break;
      }
      case ALL_ROUTER_TYPES.CONSOLE: {
        const navInfo: NavInfo = {
          navTitle: t('console'),
          backPath: '',
        };
        setNavInfo(navInfo);
        break;
      }
      default:
        break;
    }
  }, [type, t, setNavInfo, collectionName]);
};
