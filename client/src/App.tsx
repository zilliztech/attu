import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import { RootProvider } from './context/Root';
import { NavProvider } from './context/Navigation';
import { AuthProvider } from './context/Auth';
import { WebSocketProvider } from './context/WebSocket';
import { PrometheusProvider } from './context/Prometheus';

function App() {
  return (
    <AuthProvider>
      <RootProvider>
        <PrometheusProvider>
          <WebSocketProvider>
            <NavProvider>
              <MuiPickersUtilsProvider utils={DayjsUtils}>
                <Router></Router>
              </MuiPickersUtilsProvider>
            </NavProvider>
          </WebSocketProvider>
        </PrometheusProvider>
      </RootProvider>
    </AuthProvider>
  );
}

export default App;
