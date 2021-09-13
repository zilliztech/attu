import Router from './router/Router';
import { RootProvider } from './context/Root';
import { NavProvider } from './context/Navigation';
import { AuthProvider } from './context/Auth';
import { WebSocketProvider } from './context/WebSocket';

function App() {
  return (
    <RootProvider>
      <AuthProvider>
        <WebSocketProvider>
          <NavProvider>
            <Router></Router>
          </NavProvider>
        </WebSocketProvider>
      </AuthProvider>
    </RootProvider>
  );
}

export default App;
