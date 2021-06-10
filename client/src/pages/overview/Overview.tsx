import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';

const Overview = () => {
  useNavigationHook(ALL_ROUTER_TYPES.OVERVIEW);

  return <section>overview</section>;
};

export default Overview;
