import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import { MilvusHttp } from '../../http/Milvus';
import { useInterval } from '../../hooks/SystemView';
import Topo from './Topology';
import NodeListView from './NodeListView';
import LineChartCard from './LineChartCard';
import ProgressCard from './ProgressCard';
import DataCard from './DataCard';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    fontFamily: 'Roboto',
    margin: '14px 40px',
    position: 'relative',
    height: 'calc(100vh - 80px)',
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
    zIndex: 1000,
    backgroundColor: 'white',
  },
  showChildView: {
    top: 0,
    maxHeight: 'auto',
  },
  hideChildView: {
    top: '1000px',
    maxHeight: 0,
  },
  childCloseBtn: {
    border: 0,
    backgroundColor: 'white',
    width: '100%',
  }
}));


const parseJson = (jsonData: any) => {
  const nodes: any[] = [];
  const childNodes: any[] = [];

  const system = {
    // qps: Math.random() * 1000,
    letency: Math.random() * 1000,
    disk: 0,
    diskUsage: 0,
    memory: 0,
    memoryUsage: 0,
  }

  jsonData?.response?.nodes_info.forEach((node: any) => {
    const type = node?.infos?.type;
    // coordinator node
    if (type.includes("Coord")) {
      nodes.push(node);
      // other nodes
    } else {
      childNodes.push(node);
    }

    const info = node.infos.hardware_infos;
    system.memory += info.memory;
    system.memoryUsage += info.memory_usage;
    system.disk += info.disk;
    system.diskUsage += info.disk_usage;
  });
  return { nodes, childNodes, system };
}


const SystemView: any = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);
  const { t } = useTranslation('systemView');

  const classes = getStyles();
  const INTERVAL = 10000;

  const [data, setData] = useState<{ nodes: any, childNodes: any, system: any }>({ nodes: [], childNodes: [], system: {} });
  const [selectedNode, setNode] = useState<any>();
  const [selectedCord, setCord] = useState<any>();
  const { nodes, childNodes, system } = data;

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

  let qps = system?.qps || 0;
  const letency = system?.letency || 0;
  const childView = useRef<HTMLInputElement>(null);

  return (
    <div className={classes.root}>
      <div className={clsx(classes.cardContainer, selectedCord && classes.transparent)}>
        <ProgressCard title={t('diskTitle')} usage={system.diskUsage} total={system.disk} />
        <ProgressCard title={t('memoryTitle')} usage={system.memoryUsage} total={system.memory} />
        <LineChartCard title={t('qpsTitle')} value={qps} />
        <LineChartCard title={t('letencyTitle')} value={letency} />
      </div>
      <div className={classes.contentContainer}>
        <Topo nodes={nodes} setNode={setNode} setCord={setCord} />
        <DataCard node={selectedNode} extend />
      </div>

      <div
        ref={childView}
        className={clsx(classes.childView,
          selectedCord ? classes.showChildView : classes.hideChildView)}
      >
        {selectedCord && (<NodeListView selectedCord={selectedCord} childNodes={childNodes} setCord={setCord} />)}
      </div>
    </div >

  );
};

export default SystemView;
