import { useState, useCallback } from 'react';
import React from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { SwipeableDrawer } from '@material-ui/core';
import {
  RootContextType,
  DialogType,
  SnackBarType,
  OpenSnackBarType,
} from './Types';
import CustomSnackBar from '../components/customSnackBar/CustomSnackBar';
import CustomDialog from '../components/customDialog/CustomDialog';
import { theme } from '../styles/theme';

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

export const rootContext = React.createContext<RootContextType>({
  openSnackBar: (
    message,
    type = 'success',
    autoHideDuration,
    position = { vertical: 'top', horizontal: 'right' }
  ) => {},
  dialog: DefaultDialogConfigs,
  setDialog: params => {},
  handleCloseDialog: () => {},
  setDrawer: (params: any) => {},
});

const { Provider } = rootContext;
// Dialog has two type : normal | custom;
// notice type mean it's a notice dialog you need to set props like title, content, actions
// custom type could have own state, you could set a complete component in dialog.
export const RootProvider = (props: { children: React.ReactNode }) => {
  const classes = makeStyles({
    paper: {
      minWidth: '300px',
      borderRadius: '0px',
    },
    paperAnchorRight: {
      width: '40vw',
    },
  })();
  const [snackBar, setSnackBar] = useState<SnackBarType>({
    open: false,
    type: 'success',
    message: '',
    vertical: 'top',
    horizontal: 'right',
    autoHideDuration: 3000,
  });
  const [dialog, setDialog] = useState<DialogType>(DefaultDialogConfigs);
  const [drawer, setDrawer]: any = useState({
    anchor: 'right',
    open: false,
    child: <></>,
  });

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
    // setDialog(DefaultDialogConfigs);
    setDialog({
      ...dialog,
      open: false,
    });
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawer({ ...drawer, open: open });
    };

  return (
    <Provider
      value={{
        openSnackBar,
        dialog,
        setDialog,
        handleCloseDialog,
        setDrawer,
      }}
    >
      <ThemeProvider theme={theme}>
        <CustomSnackBar {...snackBar} onClose={handleSnackBarClose} />
        {props.children}
        <CustomDialog {...dialog} onClose={handleCloseDialog} />

        <SwipeableDrawer
          anchor={drawer.anchor}
          open={drawer.open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          classes={{ paperAnchorRight: classes.paperAnchorRight }}
        >
          {drawer.child}
        </SwipeableDrawer>
      </ThemeProvider>
    </Provider>
  );
};
