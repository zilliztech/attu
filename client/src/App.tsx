import Router from './router/Router';
import { RootProvider } from './context/Root';
import { NavProvider } from './context/Navigation';
import { AuthProvider } from './context/Auth';

function App() {
  return (
    <RootProvider>
      <AuthProvider>
        <NavProvider>
          <Router></Router>
        </NavProvider>
      </AuthProvider>
    </RootProvider>
  );
}

export default App;
