import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';

const Console = () => {
  useNavigationHook(ALL_ROUTER_TYPES.CONSOLE);
  return <section>console</section>;
};

export default Console;
