import { ReactElement } from 'react';

export type RootContextType = {
  openSnackBar: OpenSnackBarType;
  dialog: DialogType;
  setDialog: (params: DialogType) => void;
  handleCloseDialog: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setDrawer: (params: any) => void;
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
     *  */
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
