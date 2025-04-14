import { Dispatch, ReactElement, SetStateAction } from 'react';
import type { NavInfo } from '@/router/Types';
import type {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/schema/Types';
import type {
  CollectionObject,
  CollectionFullObject,
  DatabaseObject,
  AuthReq,
  AuthObject,
  ResStatus
} from '@server/types';

export type RootContextType = {
  openSnackBar: OpenSnackBarType;
  dialog: DialogType;
  dialog2: DialogType;
  setDialog: (params: DialogType) => void;
  setDialog2: (params: DialogType) => void;
  handleCloseDialog: () => void;
  handleCloseDialog2: () => void;
  versionInfo: { attu: string; sdk: string };
  drawer: DrawerType;
  setDrawer: (params: DrawerType) => void;
};

// this is for any custom dialog
export type DialogType = {
  open: boolean;
  type: 'notice' | 'custom';
  params: {
    title?: string;
    component?: React.ReactNode;
    confirm?: () => Promise<any>;
    cancel?: () => Promise<any>;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmClass?: string;
    /**
     * Usually we control open status in root context,
     * if we need a hoc component depend on setDialog in context,
     * we may need control open status by ourself
     **/
    handleClose?: () => void;

    // used for dialog position
    containerClass?: string;
  };
};

export type SnackBarType = {
  open: boolean;
  message: string | ReactElement;
  type?: 'error' | 'info' | 'success' | 'warning';
  autoHideDuration?: number | null;
  horizontal: 'center' | 'left' | 'right';
  vertical: 'bottom' | 'top';
};

export type OpenSnackBarType = (
  message: string | ReactElement,
  type?: 'error' | 'info' | 'success' | 'warning',
  autoHideDuration?: number | null,
  position?: {
    horizontal: 'center' | 'left' | 'right';
    vertical: 'bottom' | 'top';
  }
) => void;

export type AuthContextType = {
  authReq: AuthReq;
  setAuthReq: Dispatch<SetStateAction<AuthReq>>;
  clientId: string;
  isManaged: boolean;
  isServerless: boolean;
  isDedicated: boolean;
  isAuth: boolean;
  logout: (pass?: boolean) => void;
  login: (params: AuthReq) => Promise<AuthObject>;
};

export type SystemContextType = {
  data?: any;
};

export type PrometheusContextType = {
  withPrometheus: boolean;
  setWithPrometheus: Dispatch<SetStateAction<boolean>>;
  isPrometheusReady: boolean;
  prometheusAddress: string;
  prometheusInstance: string;
  prometheusNamespace: string;
  setPrometheusAddress: Dispatch<SetStateAction<string>>;
  setPrometheusInstance: Dispatch<SetStateAction<string>>;
  setPrometheusNamespace: Dispatch<SetStateAction<string>>;
};

export type NavContextType = {
  navInfo: NavInfo;
  setNavInfo: (param: NavInfo) => void;
};

export type DataContextType = {
  loading: boolean;
  loadingDatabases: boolean;
  collections: CollectionObject[];
  setCollections: Dispatch<SetStateAction<CollectionObject[]>>;
  database: string;
  setDatabase: Dispatch<SetStateAction<string>>;
  databases: DatabaseObject[];
  setDatabaseList: Dispatch<SetStateAction<DatabaseObject[]>>;

  // APIs
  // databases
  fetchDatabases: () => Promise<DatabaseObject[]>;
  createDatabase: (params: { db_name: string }) => Promise<ResStatus>;
  dropDatabase: (params: { db_name: string }) => Promise<ResStatus>;

  // collections
  fetchCollections: () => Promise<void>;
  fetchCollection: (name: string) => Promise<CollectionFullObject>;
  createCollection: (data: any) => Promise<CollectionFullObject>;
  loadCollection: (name: string, param?: any) => Promise<ResStatus>;
  releaseCollection: (name: string) => Promise<ResStatus>;
  renameCollection: (
    name: string,
    newName: string
  ) => Promise<CollectionFullObject>;
  duplicateCollection: (
    name: string,
    newName: string
  ) => Promise<CollectionFullObject>;
  dropCollection: (name: string) => Promise<ResStatus>;
  createIndex: (param: IndexCreateParam) => Promise<CollectionFullObject>;
  dropIndex: (params: IndexManageParam) => Promise<CollectionFullObject>;
  createAlias: (
    collectionName: string,
    alias: string
  ) => Promise<CollectionFullObject>;
  dropAlias: (
    collectionName: string,
    alias: string
  ) => Promise<CollectionFullObject>;
  setCollectionProperty: (
    collectionName: string,
    key: string,
    value: any
  ) => Promise<CollectionFullObject>;
  // UI preferences
  ui: {
    tree: {
      width: number;
    };
  };
  setUIPref: (pref: DataContextType['ui']) => void;
};

export interface DrawerAction {
  label: string;
  onClick: () => void;
}

export interface DrawerType {
  open: boolean;
  title: string;
  content: React.ReactNode;
  hasActionBar: boolean;
  actions?: DrawerAction[];
}
