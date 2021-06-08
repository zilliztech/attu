import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import routerConfig from './Config';
import Layout from '../components/layout/Layout';
/**
 * Global responsible for global effect
 * Layout responsible for ui view
 *
 */
const RouterWrapper = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          {routerConfig.map(v => (
            <Route key={v.path} exact path={v.path} component={v.component} />
          ))}

          <Route
            render={() => {
              return (
                <Redirect
                  to={{
                    pathname: '/',
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
