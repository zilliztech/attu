import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  WebSocketProvider,
  PrometheusProvider,
  DatabaseProvider,
} from './context';

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
