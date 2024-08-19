import { StyledEngineProvider } from '@mui/material';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  DataProvider,
  SystemProvider,
  ColorModeProvider,
} from './context';

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ColorModeProvider>
        <AuthProvider>
          <DataProvider>
            <RootProvider>
              <SystemProvider>
                <NavProvider>
                  <Router></Router>
                </NavProvider>
              </SystemProvider>
            </RootProvider>
          </DataProvider>
        </AuthProvider>
      </ColorModeProvider>
    </StyledEngineProvider>
  );
}

export default App;
