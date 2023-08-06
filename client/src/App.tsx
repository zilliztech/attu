import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import { RootProvider } from './context/Root';
import { NavProvider } from './context/Navigation';
import { AuthProvider } from './context/Auth';
import { WebSocketProvider } from './context/WebSocket';
import { PrometheusProvider } from './context/Prometheus';
import { DatabaseProvider } from './context/Database';

function App() {
  return (
    <AuthProvider>
      <RootProvider>
        <DatabaseProvider>
          <PrometheusProvider>
            <WebSocketProvider>
              <NavProvider>
                <MuiPickersUtilsProvider utils={DayjsUtils}>
                  <Router></Router>
                </MuiPickersUtilsProvider>
              </NavProvider>
            </WebSocketProvider>
          </PrometheusProvider>
        </DatabaseProvider>
      </RootProvider>
    </AuthProvider>
  );
}

export default App;
