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
      <DataProvider>
        <RootProvider>
          <SystemProvider>
            <PrometheusProvider>
              <NavProvider>
                <MuiPickersUtilsProvider utils={DayjsUtils}>
                  <Router></Router>
                </MuiPickersUtilsProvider>
              </NavProvider>
            </PrometheusProvider>
          </SystemProvider>
        </RootProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
