import { Dispatch, ReactElement, SetStateAction } from 'react';
import { CollectionObject, CollectionFullObject } from '@server/types';
import { NavInfo } from '@/router/Types';

export type RootContextType = {
  openSnackBar: OpenSnackBarType;
  dialog: DialogType;
  setDialog: (params: DialogType) => void;
  handleCloseDialog: () => void;
  setDrawer: (params: any) => void;
  versionInfo: { attu: string; sdk: string };
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
  isAuth: boolean;
  clientId: string;
  address: string;
  username: string;
  isManaged: boolean;
  logout: Function;
  setAddress: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setIsAuth: Dispatch<SetStateAction<boolean>>;
  setClientId: Dispatch<SetStateAction<string>>;
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
  collections: CollectionObject[];
  setCollections: Dispatch<SetStateAction<CollectionObject[]>>;
  database: string;
  setDatabase: Dispatch<SetStateAction<string>>;
  databases: string[];
  setDatabaseList: Dispatch<SetStateAction<string[]>>;
  fetchDatabases: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  fetchCollection: (name: string) => Promise<CollectionFullObject>;
  createCollection: (data: any) => Promise<CollectionFullObject>;
  renameCollection: (name: string, newName: string) => Promise<CollectionFullObject>;
  duplicateCollection: (name: string, newName: string) => Promise<CollectionFullObject>;
  dropCollection: (name: string) => Promise<void>;
};
