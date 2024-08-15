import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  DataProvider,
  PrometheusProvider,
  SystemProvider,
} from './context';
import { theme } from './styles/theme';

function App() {
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
