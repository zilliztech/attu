import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import Topo from './Topology';

const SystemView = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);

  return (
    <div>
      <Topo />
    </div>
  );
};

export default SystemView;
