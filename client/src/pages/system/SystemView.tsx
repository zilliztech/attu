import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import Topo from './Topology';
import LineChart from './LineChart';
import Progress from './Progress';

const SystemView = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);

  return (
    <div>

      <Progress percent={50} color={"#06F3AF"} />
      <Progress percent={90} color={"#635DCE"} />
      <LineChart />
      <Topo />
    </div>
  );
};

export default SystemView;
