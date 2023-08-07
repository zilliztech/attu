import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  WebSocketProvider,
  PrometheusProvider,
  DataProvider,
} from './context';

function App() {
  return (
    <AuthProvider>
      <RootProvider>
        <DataProvider>
          <PrometheusProvider>
            <WebSocketProvider>
              <NavProvider>
                <MuiPickersUtilsProvider utils={DayjsUtils}>
                  <Router></Router>
                </MuiPickersUtilsProvider>
              </NavProvider>
            </WebSocketProvider>
          </PrometheusProvider>
        </DataProvider>
      </RootProvider>
    </AuthProvider>
  );
}

export default App;
