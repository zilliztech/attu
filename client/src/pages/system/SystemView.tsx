import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigationHook, useInterval } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { MilvusService } from '@/http';
import { parseJson } from '@/utils';
import Topo from './Topology';
import NodeListView from './NodeListView';
// import LineChartCard from './LineChartCard';
// import ProgressCard from './ProgressCard';
import DataCard from './DataCard';

const SystemView: any = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);
  // const { t } = useTranslation('systemView');

  const INTERVAL = 60000;

  const [data, setData] = useState<{
    nodes: any;
    childNodes: any;
    system: any;
  }>({ nodes: [], childNodes: [], system: {} });
  const [selectedNode, setNode] = useState<any>();
  const [selectedCord, setCord] = useState<any>();
  const [showChildView, setShowChildView] = useState(false);
  const { nodes, childNodes } = data;

  useInterval(async () => {
    if (!selectedCord) {
      const res = await MilvusService.getMetrics();
      setData(parseJson(res));
    }
  }, INTERVAL);

  useEffect(() => {
    async function fetchData() {
      const res = await MilvusService.getMetrics();
      setData(parseJson(res));
    }
    fetchData();
  }, []);

  // let qps = system?.qps || 0;
  // const latency = system?.latency || 0;
  const childView = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={theme => ({
        margin: '16px',
        position: 'relative',
        display: 'flex',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
      })}
    >
      <Box
        sx={{
          display: 'flex',
          borderRadius: 2,
          gap: 1,
          width: '100%',
        }}
      >
        <Box
          sx={theme => ({
            width: '70%',
            background: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
          })}
        >
          <Topo
            nodes={nodes}
            childNodes={childNodes}
            setNode={setNode}
            setCord={setCord}
            setShowChildView={setShowChildView}
          />
        </Box>
        <Box sx={{ width: '30%', borderRadius: 2 }}>
          <DataCard node={selectedNode} extend={true} />
        </Box>
      </Box>

      <Box
        ref={childView}
        sx={theme => ({
          height: '100%',
          width: '100%',
          transition: 'all .25s',
          position: 'absolute',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          top: showChildView ? 0 : 1600,
          opacity: showChildView ? 1 : 0,
        })}
      >
        {selectedCord && (
          <NodeListView
            selectedCord={selectedCord}
            childNodes={childNodes}
            setCord={setCord}
            setShowChildView={setShowChildView}
          />
        )}
      </Box>
    </Box>
  );
};

export default SystemView;
