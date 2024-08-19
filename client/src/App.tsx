import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  DataProvider,
  PrometheusProvider,
  SystemProvider,
} from './context';
import { createTheme } from '@mui/material/styles';
import getCommonThemes from './styles/theme';

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => createTheme(getCommonThemes(prefersDarkMode ? 'dark' : 'light')),
    [true]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <DataProvider>
            <RootProvider>
              <SystemProvider>
                <PrometheusProvider>
                  <NavProvider>
                    <Router></Router>
                  </NavProvider>
                </PrometheusProvider>
              </SystemProvider>
            </RootProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
