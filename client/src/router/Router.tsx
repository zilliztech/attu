import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import routerConfig from './Config';
import Layout from '../components/layout/Layout';
import { useContext } from 'react';
import { authContext } from '../context/Auth';
/**
 * Global responsible for global effect
 * Layout responsible for ui view
 *
 */
const RouterWrapper = () => {
  const { isAuth } = useContext(authContext);

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          {routerConfig.map(v => (
            <Route
              exact
              key={v.path}
              path={v.path}
              render={() => {
                console.log('isauth', isAuth);
                const Page = v.component;
                return isAuth || !v.auth ? (
                  <Page />
                ) : (
                  <Redirect
                    to={{
                      pathname: '/connect',
                    }}
                  />
                );
              }}
            />
          ))}

          <Route
            render={() => {
              return (
                <Redirect
                  to={{
                    pathname: '/connect',
                  }}
                />
              );
            }}
          ></Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};
export default RouterWrapper;
