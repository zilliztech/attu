import { ReactNode } from 'react';
import { NavMenuItem } from '@/components/menu/Types';
import icons from '@/components/icons/Icons';
import Databases from '@/pages/databases/Databases';
import Users from '@/pages/user/UsersAndRoles';
import System from '@/pages/system/SystemView';
import Play from '@/pages/play/Play';
import Overview from '@/pages/home/Home';

// Route path constants
export const ROUTE_PATHS = {
  HOME: '/',
  DATABASES: 'databases',
  COLLECTIONS: 'collections',
  COLLECTION_DETAIL: 'collection-detail',
  USERS: 'users',
  ROLES: 'roles',
  PRIVILEGE_GROUPS: 'privilege-groups',
  PLAY: 'play',
  SYSTEM: 'system',
  CONNECT: 'connect',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

// Default navigation configuration
const DEFAULT_NAV_CONFIG: NavConfig = {
  showDatabaseSelector: false,
  navTitleKey: '',
  useCollectionNameAsTitle: false,
  backPath: '',
};

export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
}

export interface NavConfig {
  showDatabaseSelector?: boolean;
  navTitleKey?: string;
  useCollectionNameAsTitle?: boolean;
  backPath?: string;
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
  navConfig?: NavConfig;
  routerType: RoutePath;
}

// Database routes configuration
const databaseRoutes: RouteItem[] = [
  {
    path: ROUTE_PATHS.DATABASES,
    element: Databases,
    showInMenu: true,
    menuConfig: {
      icon: icons.database,
      label: 'database',
      key: 'databases',
    },
    routerType: ROUTE_PATHS.DATABASES,
    navConfig: {
      showDatabaseSelector: true,
      useCollectionNameAsTitle: true,
    },
    children: [
      {
        path: ':databaseName',
        element: Databases,
        routerType: ROUTE_PATHS.COLLECTIONS,
        navConfig: {
          showDatabaseSelector: true,
          navTitleKey: 'collections',
        },
      },
      {
        path: ':databaseName/:databasePage',
        element: Databases,
        routerType: ROUTE_PATHS.DATABASES,
        navConfig: {
          showDatabaseSelector: true,
          navTitleKey: 'dbAdmin',
        },
      },
      {
        path: ':databaseName/:collectionName/:collectionPage',
        element: Databases,
        routerType: ROUTE_PATHS.COLLECTION_DETAIL,
        navConfig: {
          showDatabaseSelector: true,
          useCollectionNameAsTitle: true,
        },
      },
    ],
  },
];

// User management routes
const userRoutes: RouteItem[] = [
  {
    path: ROUTE_PATHS.USERS,
    element: Users,
    showInMenu: true,
    menuConfig: {
      icon: icons.navPerson,
      label: 'user',
      key: 'users',
    },
    routerType: ROUTE_PATHS.USERS,
    navConfig: {
      navTitleKey: 'user',
    },
    showWhenNotManagedOrDedicated: true,
  },
  {
    path: ROUTE_PATHS.ROLES,
    element: Users,
    showInMenu: false,
    routerType: ROUTE_PATHS.USERS,
    navConfig: {
      navTitleKey: 'user',
      backPath: `/${ROUTE_PATHS.USERS}`,
    },
    showWhenNotManagedOrDedicated: true,
  },
  {
    path: ROUTE_PATHS.PRIVILEGE_GROUPS,
    element: Users,
    showInMenu: false,
    routerType: ROUTE_PATHS.USERS,
    navConfig: {
      navTitleKey: 'user',
      backPath: `/${ROUTE_PATHS.USERS}`,
    },
    showWhenNotManagedOrDedicated: true,
  },
];

// Other routes
const otherRoutes: RouteItem[] = [
  {
    path: ROUTE_PATHS.HOME,
    element: Overview,
    showInMenu: true,
    menuConfig: {
      icon: icons.attu,
      label: 'overview',
      key: 'overview',
    },
    routerType: ROUTE_PATHS.HOME,
    navConfig: {
      navTitleKey: 'welcome',
    },
  },
  {
    path: ROUTE_PATHS.PLAY,
    element: Play,
    showInMenu: true,
    menuConfig: {
      icon: icons.code,
      label: 'play',
      key: 'play',
    },
    routerType: ROUTE_PATHS.PLAY,
    navConfig: {
      navTitleKey: 'play',
    },
  },
  {
    path: ROUTE_PATHS.SYSTEM,
    element: System,
    showInMenu: true,
    menuConfig: {
      icon: icons.navSystem,
      label: 'system',
      key: 'system',
    },
    routerType: ROUTE_PATHS.SYSTEM,
    navConfig: {
      navTitleKey: 'system',
    },
    showWhenNotManaged: true,
  },
  {
    path: ROUTE_PATHS.CONNECT,
    element: () => null,
    showInMenu: false,
    requiresAuth: false,
    routerType: ROUTE_PATHS.HOME,
  },
];

// Combine all routes
export const routes: RouteItem[] = [
  // Home should be first
  ...otherRoutes.filter(route => route.path === ROUTE_PATHS.HOME),
  // Then databases
  ...databaseRoutes,
  // Then users
  ...userRoutes,
  // Then other routes (excluding home)
  ...otherRoutes.filter(route => route.path !== ROUTE_PATHS.HOME),
];

// Helper function to merge navigation config with defaults
export const mergeNavConfig = (config?: NavConfig): NavConfig => ({
  ...DEFAULT_NAV_CONFIG,
  ...config,
});

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
          if (route.path === ROUTE_PATHS.DATABASES) {
            navigate(`/${ROUTE_PATHS.DATABASES}/${database}/collections`);
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
