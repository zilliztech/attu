import { useState, useCallback, useEffect, useContext } from 'react';
import React from 'react';
import { authContext } from '@/context';
import CustomSnackBar from '@/components/customSnackBar/CustomSnackBar';
import CustomDialog from '@/components/customDialog/CustomDialog';
import CustomDrawer from '@/components/customDrawer/CustomDrawer';
import { MilvusService } from '@/http';
import type {
  RootContextType,
  DialogType,
  SnackBarType,
  OpenSnackBarType,
  DrawerType,
} from './Types';

const DefaultDialogConfigs: DialogType = {
  open: false,
  type: 'notice',
  params: {
    title: '',
    component: <></>,
    confirm: () => new Promise((res, rej) => res(true)),
    cancel: () => new Promise((res, rej) => res(true)),
  },
};

const DefaultDrawerConfigs: DrawerType = {
  open: false,
  title: '',
  content: <></>,
  hasActionBar: false,
  actions: [],
};

export const rootContext = React.createContext<RootContextType>({
  openSnackBar: (
    message,
    type = 'success',
    autoHideDuration,
    position = { vertical: 'top', horizontal: 'right' }
  ) => {},
  dialog: DefaultDialogConfigs,
  dialog2: DefaultDialogConfigs,
  setDialog: params => {},
  setDialog2: params => {},
  handleCloseDialog: () => {},
  handleCloseDialog2: () => {},
  versionInfo: { attu: '', sdk: '' },
  drawer: DefaultDrawerConfigs, // Add drawer to context
  setDrawer: () => {}, // Function to set drawer state
});

const { Provider } = rootContext;

// Dialog has two type : normal | custom;
// notice type mean it's a notice dialog you need to set props like title, content, actions
// custom type could have own state, you could set a complete component in dialog.
export const RootProvider = (props: { children: React.ReactNode }) => {
  const { isAuth } = useContext(authContext);

  const [snackBar, setSnackBar] = useState<SnackBarType>({
    open: false,
    type: 'success',
    message: '',
    vertical: 'top',
    horizontal: 'right',
    autoHideDuration: 1000,
  });
  const [dialog, setDialog] = useState<DialogType>(DefaultDialogConfigs);
  const [dialog2, setDialog2] = useState<DialogType>(DefaultDialogConfigs);

  const [drawer, setDrawer] = useState<DrawerType>({
    open: false,
    title: '',
    content: <></>,
    hasActionBar: false,
    actions: [],
  });

  const [versionInfo, setVersionInfo] = useState({ attu: '', sdk: '' });

  const handleSnackBarClose = () => {
    setSnackBar(v => ({ ...v, open: false }));
  };
  const openSnackBar: OpenSnackBarType = useCallback(
    (
      message = '',
      type = 'success',
      autoHideDuration: number | null | undefined = 5000,
      position = { vertical: 'top', horizontal: 'right' }
    ) => {
      setSnackBar({
        open: true,
        message,
        type,
        autoHideDuration,
        ...position,
      });
    },
    []
  );

  const handleCloseDialog = () => {
    setDialog({
      ...dialog,
      open: false,
    });
  };
  const handleCloseDialog2 = () => {
    setDialog2({
      ...dialog2,
      open: false,
    });
  };

  useEffect(() => {
    if (isAuth) {
      const fetchVersion = async () => {
        const res = await MilvusService.getVersion();
        setVersionInfo(res as any);
      };
      fetchVersion();
    }
  }, [isAuth]);

  useEffect(() => {
    // if auth is off, hide snack bar
    if (!isAuth) {
      setSnackBar({
        open: false,
        type: 'success',
        message: '',
        vertical: 'top',
        horizontal: 'right',
        autoHideDuration: 3000,
      });
    }
  }, [isAuth]);

  return (
    <Provider
      value={{
        openSnackBar,
        dialog,
        dialog2,
        setDialog,
        setDialog2,
        handleCloseDialog,
        handleCloseDialog2,
        versionInfo,
        drawer,
        setDrawer,
      }}
    >
      {props.children}

      <CustomSnackBar {...snackBar} onClose={handleSnackBarClose} />
      <CustomDialog {...dialog} onClose={handleCloseDialog} />
      <CustomDialog {...dialog2} onClose={handleCloseDialog2} />

      <CustomDrawer />
    </Provider>
  );
};
