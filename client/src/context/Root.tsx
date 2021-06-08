import React, { useState, useCallback } from 'react';
import {
  createMuiTheme,
  ThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import { Backdrop, CircularProgress, SwipeableDrawer } from '@material-ui/core';

import {
  RootContextType,
  DialogType,
  SnackBarType,
  OpenSnackBarType,
} from './Types';
import CustomSnackBar from '../components/customSnackBar/CustomSnackBar';
import CustomDialog from '../components/customDialog/CustomDialog';
import lightBlue from '@material-ui/core/colors/lightBlue';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    zilliz: Palette['primary'];
  }
  interface PaletteOptions {
    zilliz: PaletteOptions['primary'];
  }
}

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
  setGlobalLoading: () => {},
  setDrawer: (params: any) => {},
});

const otherThemes = {
  spacing: (factor: any) => `${8 * factor}px`,
};

const theme = createMuiTheme({
  palette: {
    primary: {
      ...lightBlue,
      main: '#06AFF2',
      light: '#65DAF8',
      dark: '#009BC4',
    },
    secondary: {
      light: '#82D3BA',
      main: '#31B78D',
      dark: '#279371',
    },
    error: {
      main: '#FF4605',
      light: '#FF8F68',
      dark: '#CD3804',
    },
    zilliz: {
      ...lightBlue,
      light: lightBlue[50],
    },
  },
  ...otherThemes,
  overrides: {
    MuiTypography: {
      button: {
        textTransform: 'initial',
        lineHeight: '16px',
        fontWeight: 'bold',
      },
      h1: {
        fontSize: '36px',
        lineHeight: '42px',
        letterSpacing: '-0.02em',
      },
      h2: {
        lineHeight: '24px',
        fontSize: '28px',
      },
      h3: {
        lineHeight: '20px',
        fontSize: '23px',
        fontWeight: 'bold',
      },
      h4: {
        fontWeight: 500,
        lineHeight: '23px',
        fontSize: '20px',
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 'bold',
        fontSize: '16px',
        lineHeight: '24px',
      },
      h6: {
        fontWeight: 'normal',
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: '14px',
        lineHeight: '20px',
      },
      body2: {
        fontSize: '12px',
        lineHeight: '16px',
      },
      caption: {
        fontSize: '10px',
        lineHeight: '12px',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'initial',
        fontWeight: 'bold',
      },
      text: {
        '&:hover': {
          backgroundColor: lightBlue[50],
        },
      },
    },
    MuiDialogActions: {
      spacing: {
        padding: otherThemes.spacing(4),
      },
    },
    MuiDialogContent: {
      root: {
        padding: `${otherThemes.spacing(1)} ${otherThemes.spacing(4)}`,
      },
    },
    MuiDialogTitle: {
      root: {
        padding: otherThemes.spacing(4),
        paddingBottom: otherThemes.spacing(1),
      },
    },
    MuiStepIcon: {
      root: {
        color: '#c4c4c4',
        '&$active': {
          color: '#12C3F4',
        },
        '&$completed': {
          color: '#12C3F4',
        },
      },
    },
    MuiFormHelperText: {
      contained: {
        marginLeft: 0,
      },
    },
  },
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
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
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
        setGlobalLoading,
        setDrawer,
      }}
    >
      <ThemeProvider theme={theme}>
        <CustomSnackBar {...snackBar} onClose={handleSnackBarClose} />
        {props.children}
        <CustomDialog {...dialog} onClose={handleCloseDialog} />
        <Backdrop open={globalLoading} style={{ zIndex: 2000 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

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
