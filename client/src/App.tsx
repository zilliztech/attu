import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';
import Router from './router/Router';
import { RootProvider } from './context/Root';
import { NavProvider } from './context/Navigation';
import { AuthProvider } from './context/Auth';
import { WebSocketProvider } from './context/WebSocket';

function App() {
  return (
    <AuthProvider>
      <RootProvider>
        <WebSocketProvider>
          <NavProvider>
            <MuiPickersUtilsProvider utils={DayjsUtils}>
              <Router></Router>
            </MuiPickersUtilsProvider>
          </NavProvider>
        </WebSocketProvider>
      </RootProvider>
    </AuthProvider>
  );
}

export default App;
