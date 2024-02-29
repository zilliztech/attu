import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import {
  RootProvider,
  NavProvider,
  AuthProvider,
  DataProvider,
  PrometheusProvider,
  SystemProvider,
} from './context';

function App() {
  return (
    <AuthProvider>
      <RootProvider>
        <SystemProvider>
          <PrometheusProvider>
            <DataProvider>
              <NavProvider>
                <MuiPickersUtilsProvider utils={DayjsUtils}>
                  <Router></Router>
                </MuiPickersUtilsProvider>
              </NavProvider>
            </DataProvider>
          </PrometheusProvider>
        </SystemProvider>
      </RootProvider>
    </AuthProvider>
  );
}

export default App;
