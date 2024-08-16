import { useState, useEffect, useRef } from 'react';
import { Theme } from '@mui/material';
import clsx from 'clsx';
import { useNavigationHook, useInterval } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { MilvusService } from '@/http';
import { parseJson } from '@/utils';
import Topo from './Topology';
import NodeListView from './NodeListView';
// import LineChartCard from './LineChartCard';
// import ProgressCard from './ProgressCard';
import DataCard from './DataCard';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '16px',
    position: 'relative',
    display: 'flex',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
  },
  transparent: {
    opacity: 0,
    transition: 'opacity .5s',
  },
  contentContainer: {
    display: 'flex',
    borderRadius: 8,
    gap: 8,
    width: '100%',
  },
  left: {
    width: '70%',
    background: theme.palette.background.paper,
    borderRadius: 8,
  },
  right: { width: '30%', borderRadius: 8 },
  childView: {
    height: '100%',
    width: '100%',
    transition: 'all .25s',
    position: 'absolute',
    // zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
  },
  showChildView: {
    top: 0,
    opacity: 1,
  },
  hideChildView: {
    top: 1600,
    opacity: 0,
  },
  childCloseBtn: {
    border: 0,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
}));

const SystemView: any = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);
  // const { t } = useTranslation('systemView');

  const classes = getStyles();
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
    <div className={classes.root}>
      <div className={classes.contentContainer}>
        <div className={classes.left}>
          <Topo
            nodes={nodes}
            childNodes={childNodes}
            setNode={setNode}
            setCord={setCord}
            setShowChildView={setShowChildView}
          />
        </div>
        <div className={classes.right}>
          <DataCard node={selectedNode} extend={true} />
        </div>
      </div>

      <div
        ref={childView}
        className={clsx(
          classes.childView,
          showChildView ? classes.showChildView : classes.hideChildView
        )}
      >
        {selectedCord && (
          <NodeListView
            selectedCord={selectedCord}
            childNodes={childNodes}
            setCord={setCord}
            setShowChildView={setShowChildView}
          />
        )}
      </div>
    </div>
  );
};

export default SystemView;
