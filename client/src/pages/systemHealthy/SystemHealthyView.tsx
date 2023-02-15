import { makeStyles, Theme } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { useInterval } from '../../hooks/SystemView';
import { PrometheusHttp } from '../../http/Prometheus';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import {
  EHealthyStatus,
  ENodeService,
  ENodeType,
  ILineChartData,
  INodeTreeStructure,
  IPrometheusAllData,
  IPrometheusNode,
  IThreshold,
  ITimeRangeOption,
} from './Types';
import clsx from 'clsx';
import Topology from './Topology';
import * as d3 from 'd3';
import { reconNodeTree } from './dataHandler';
import HealthyIndexOverview from './HealthyIndexOverview';
import HealthyIndexDetailView from './HealthyIndexDetailView';
// import data from "./data.json";

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    fontFamily: 'Roboto',
    margin: '14px 40px',
    position: 'relative',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid red',
  },
  mainView: {
    borderRadius: '8px',
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    marginTop: '14px',
    height: '100%',
    border: '1px solid green',
  },
  detailView: {
    height: '100%',
    width: '100%',
    transition: 'all .25s',
    position: 'absolute',
    border: '1px solid purple',
  },
  showDetailView: {
    top: 0,
    minHeight: '100%',
    height: 'fit-content',
  },
  hideDetailView: {
    top: '2000px',
    maxHeight: 0,
  },
}));

const SystemHealthyView = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);

  const classes = getStyles();

  const INTERVAL = 60000;
  const timeRangeOptions: ITimeRangeOption[] = [
    {
      label: '1h',
      value: 60 * 60 * 1000,
      step: 3 * 60 * 1000,
    },
    {
      label: '24h',
      value: 24 * 60 * 60 * 1000,
      step: 60 * 60 * 1000,
    },
    {
      label: '7d',
      value: 7 * 24 * 60 * 60 * 1000,
      step: 8 * 60 * 60 * 1000,
    },
  ];
  const [timeRange, setTimeRange] = useState<ITimeRangeOption>(
    timeRangeOptions[2]
  );
  const [nodes, setNodes] = useState<INodeTreeStructure[]>([]);
  const [lineChartsData, setLineChartsData] = useState<ILineChartData[]>([]);
  const [selectedNode, setSelectedNode] = useState<INodeTreeStructure>();
  const defaultThreshold = {
    cpu: 1,
    memory: 8 * 1024 * 1024 * 1024,
  };
  const [threshold, setThreshold] = useState<IThreshold>(defaultThreshold);

  const updateData = async () => {
    const curT = new Date().getTime();
    const result = (await PrometheusHttp.getHealthyData({
      start: curT - timeRange.value,
      end: curT,
      step: timeRange.step,
    })) as IPrometheusAllData;
    console.log('prometheus data', result);
    setNodes(reconNodeTree(result, threshold));
    setLineChartsData([
      {
        label: 'TotalCount',
        data: result.totalVectorsCount,
      },
      {
        label: 'SearchCount',
        data: result.searchVectorsCount,
      },
      {
        label: 'SearchLatency',
        data: result.sqLatency,
      },
    ]);
  };

  useEffect(() => {
    updateData();
  }, []);

  useInterval(() => {
    console.log('interval');
    updateData();
  }, INTERVAL);

  const topoNodes = !!selectedNode ? selectedNode.children : nodes;

  return (
    <div className={classes.root}>
      <div className={classes.mainView}>
        <Topology
          nodes={nodes}
          selectedNode={selectedNode as INodeTreeStructure}
          setSelectedNode={setSelectedNode}
        />
        <HealthyIndexOverview nodes={nodes} />
      </div>
      <div
        className={clsx(
          classes.detailView,
          selectedNode ? classes.showDetailView : classes.hideDetailView
        )}
      >
        {selectedNode && (
          <Topology
            nodes={selectedNode.children}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />
        )}
        <HealthyIndexDetailView />
      </div>
    </div>
  );
};

export default SystemHealthyView;
