import { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { useNavigationHook, useInterval } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { MilvusHttp } from '@/http';
import { parseJson } from '@/utils';
import Topo from './Topology';
import NodeListView from './NodeListView';
// import LineChartCard from './LineChartCard';
// import ProgressCard from './ProgressCard';
import DataCard from './DataCard';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '12px 24px',
    position: 'relative',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContainer: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(4, minmax(300px, 1fr))',
  },
  transparent: {
    opacity: 0,
    transition: 'opacity .5s',
  },
  contentContainer: {
    borderRadius: '8px',
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    marginTop: '14px',
    height: '100%',
  },
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
    minHeight: '100%',
    height: 'fit-content',
  },
  hideChildView: {
    top: '1500px',
    maxHeight: 0,
  },
  childCloseBtn: {
    border: 0,
    backgroundColor: 'white',
    width: '100%',
  },
}));

/**
 * Todo: Milvus V2.0.0 Memory data is not ready for now, open it after Milvus ready.
 * @returns
 */
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
  const { nodes, childNodes } = data;

  useInterval(async () => {
    if (!selectedCord) {
      const res = await MilvusHttp.getMetrics();
      setData(parseJson(res));
    }
  }, INTERVAL);

  useEffect(() => {
    async function fetchData() {
      const res = await MilvusHttp.getMetrics();
      setData(parseJson(res));
    }
    fetchData();
  }, []);

  // let qps = system?.qps || 0;
  // const latency = system?.latency || 0;
  const childView = useRef<HTMLInputElement>(null);

  return (
    <div className={classes.root}>
      {/* hide cards until metrics api can provide enough data*/}
      {/* <div
        className={clsx(
          classes.cardContainer,
          selectedCord && classes.transparent
        )}
      >
        <ProgressCard
          title={t('diskTitle')}
          usage={system.diskUsage}
          total={system.disk}
        />
        <ProgressCard
          title={t('memoryTitle')}
          usage={system.memoryUsage}
          total={system.memory}
        />
        <LineChartCard title={t('qpsTitle')} value={qps} />
        <LineChartCard title={t('latencyTitle')} value={latency} />
      </div> */}
      <div className={classes.contentContainer}>
        <Topo
          nodes={nodes}
          childNodes={childNodes}
          setNode={setNode}
          setCord={setCord}
        />
        <DataCard node={selectedNode} extend />
      </div>

      <div
        ref={childView}
        className={clsx(
          classes.childView,
          selectedCord ? classes.showChildView : classes.hideChildView
        )}
      >
        {selectedCord && (
          <NodeListView
            selectedCord={selectedCord}
            childNodes={childNodes}
            setCord={setCord}
          />
        )}
      </div>
    </div>
  );
};

export default SystemView;
