import Router from './router/Router';
import { RootProvider } from './context/Root';

function App() {
  return (
    <RootProvider>
      <Router></Router>
    </RootProvider>
  );
}

export default App;
