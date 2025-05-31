import { ReactNode } from 'react';
import { NavMenuItem } from '@/components/menu/Types';
import icons from '@/components/icons/Icons';
import Databases from '@/pages/databases/Databases';
import Users from '@/pages/user/UsersAndRoles';
import System from '@/pages/system/SystemView';
import Play from '@/pages/play/Play';
import Overview from '@/pages/home/Home';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
}

export interface RouteItem {
  path: string;
  element: React.ComponentType;
  children?: RouteItem[];
  showInMenu?: boolean;
  menuConfig?: {
    icon: any;
    label: string;
    key: string;
  };
  requiresAuth?: boolean;
  showWhenNotManagedOrDedicated?: boolean;
  showWhenNotManaged?: boolean;
}

export const routes: RouteItem[] = [
  {
    path: '/',
    element: Overview,
    showInMenu: true,
    menuConfig: {
      icon: icons.attu,
      label: 'overview',
      key: 'overview',
    },
  },
  {
    path: 'databases',
    element: Databases,
    showInMenu: true,
    menuConfig: {
      icon: icons.database,
      label: 'database',
      key: 'databases',
    },
    children: [
      {
        path: ':databaseName',
        element: Databases,
      },
      {
        path: ':databaseName/:databasePage',
        element: Databases,
      },
      {
        path: ':databaseName/:collectionName/:collectionPage',
        element: Databases,
      },
    ],
  },
  {
    path: 'users',
    element: Users,
    showInMenu: true,
    menuConfig: {
      icon: icons.navPerson,
      label: 'user',
      key: 'users',
    },
    showWhenNotManagedOrDedicated: true,
  },
  {
    path: 'roles',
    element: Users,
    showInMenu: false,
    showWhenNotManagedOrDedicated: true,
  },
  {
    path: 'privilege-groups',
    element: Users,
    showInMenu: false,
    showWhenNotManagedOrDedicated: true,
  },
  {
    path: 'play',
    element: Play,
    showInMenu: true,
    menuConfig: {
      icon: icons.code,
      label: 'play',
      key: 'play',
    },
  },
  {
    path: 'system',
    element: System,
    showInMenu: true,
    menuConfig: {
      icon: icons.navSystem,
      label: 'system',
      key: 'system',
    },
    showWhenNotManaged: true,
  },
  {
    path: 'connect',
    element: () => null,
    showInMenu: false,
    requiresAuth: false,
  },
];

export const getMenuItems = (
  isManaged: boolean,
  isDedicated: boolean,
  database: string,
  navTrans: (key: string) => string,
  navigate: (path: string) => void,
  authReq?: { address: string }
): NavMenuItem[] => {
  return routes
    .filter(route => {
      if (!route.showInMenu) return false;
      if (route.showWhenNotManagedOrDedicated && !(!isManaged || isDedicated))
        return false;
      if (route.showWhenNotManaged && isManaged) return false;
      return true;
    })
    .map(route => {
      const menuItem: NavMenuItem = {
        icon: route.menuConfig?.icon,
        label: navTrans(route.menuConfig?.label || ''),
        key: route.menuConfig?.key,
        onClick: () => {
          if (route.path === 'databases') {
            navigate(`/databases/${database}/collections`);
          } else {
            navigate(`/${route.path}`);
          }
        },
      };
      return menuItem;
    });
};

export const getRoutes = (
  isManaged: boolean,
  isDedicated: boolean
): RouteItem[] => {
  return routes.filter(route => {
    if (route.showWhenNotManagedOrDedicated && !(!isManaged || isDedicated))
      return false;
    if (route.showWhenNotManaged && isManaged) return false;
    return true;
  });
};
