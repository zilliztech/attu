import { useState, useEffect, useRef } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
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

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '16px',
    position: 'relative',
    display: 'flex',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
  },
  transparent: {
    opacity: 0,
    transition: 'opacity .5s',
  },
  contentContainer: {
    display: 'flex',
    border: '1px solid #e9e9ed',
    gap: 8,
    width: '100%',
  },
  left: { width: '70%', background: '#fff' },
  right: { width: '30%' },
  childView: {
    height: '100%',
    width: '100%',
    transition: 'all .25s',
    position: 'absolute',
    // zIndex: 1000,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
