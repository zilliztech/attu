import { useContext, useEffect, useState } from 'react';
import React from 'react';
import { authContext } from '@/context';
import CustomSnackBar from '@/components/customSnackBar/CustomSnackBar';
import CustomDialog from '@/components/customDialog/CustomDialog';
import CustomDrawer from '@/components/customDrawer/CustomDrawer';
import { MilvusService } from '@/http';
import { useSnackBar } from './hooks/useSnackBar';
import { useDialog } from './hooks/useDialog';
import { useDrawer } from './hooks/useDrawer';
import type { RootContextType, DialogType, DrawerType } from './Types';

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
  openSnackBar: (message, type = 'success', autoHideDuration, position) => {},
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

  const { snackBar, setSnackBar, openSnackBar, handleSnackBarClose } =
    useSnackBar();
  const { dialog, setDialog, handleCloseDialog } = useDialog();
  const {
    dialog: dialog2,
    setDialog: setDialog2,
    handleCloseDialog: handleCloseDialog2,
  } = useDialog();
  const { drawer, setDrawer } = useDrawer();

  const [versionInfo, setVersionInfo] = useState({ attu: '', sdk: '' });

  useEffect(() => {
    if (isAuth) {
      const fetchVersion = async () => {
        const res = await MilvusService.getVersion();
        setVersionInfo(res as any);
      };
      fetchVersion();
    } else {
      // if auth is off, hide snack bar
      setSnackBar({
        open: false,
        type: 'success',
        message: '',
        autoHideDuration: 3000,
        vertical: 'top',
        horizontal: 'center',
      });
      // hide dialog
      setDialog({
        ...dialog,
        open: false,
      });
      setDialog2({
        ...dialog2,
        open: false,
      });
      setDrawer({
        ...drawer,
        open: false,
      });
    }
  }, [isAuth, setSnackBar, setDialog, setDialog2, setDrawer]);

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
