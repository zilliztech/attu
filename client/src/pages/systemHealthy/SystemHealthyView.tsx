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
  INodeTreeStructure,
  IPrometheusAllData,
  IThreshold,
  ITimeRangeOption,
} from './Types';
import clsx from 'clsx';
import Topology from './Topology';
import * as d3 from 'd3';
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

const THIRD_PARTY_SERVICE_HEALTHY_THRESHOLD = 0.95;
const getThirdPartyServiceHealthyStatus = (rate: number) =>
  rate > THIRD_PARTY_SERVICE_HEALTHY_THRESHOLD
    ? EHealthyStatus.healthy
    : EHealthyStatus.failed;
const rateList2healthyStatus = (rateList: number[]) =>
  rateList.map((rate: number) => getThirdPartyServiceHealthyStatus(rate));

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
      step: 8 * 60 * 60 * 100,
    },
  ];
  const [timeRange, setTimeRange] = useState<ITimeRangeOption>(
    timeRangeOptions[0]
  );
  const [prometheusData, setPrometheusData] = useState<any>();
  const [selectedNode, setSelectedNode] = useState<string>('');
  const defaultThresholds = {
    cpu: 1,
    memory: 8,
  };
  const [threshold, setThreshold] = useState<IThreshold>(defaultThresholds);

  const updateData = async () => {
    const curT = new Date().getTime();
    const result = await PrometheusHttp.getHealthyData({
      start: curT - timeRange.value,
      end: curT,
      step: timeRange.step,
    });
    console.log(result);
    setPrometheusData(result.data as IPrometheusAllData);
  };

  useEffect(() => {
    updateData();
  }, []);

  useInterval(() => {
    console.log('interval');
    updateData();
  }, INTERVAL);

  const reconNodeTree = (
    prometheusData: IPrometheusAllData,
    threshold: IThreshold
  ) => {
    const length = prometheusData.meta.length;

    // third party
    const metaNode: INodeTreeStructure = {
      service: ENodeService.meta,
      type: ENodeType.overview,
      label: 'Meta',
      healthyStatus: rateList2healthyStatus(prometheusData.meta),
      children: [],
    };
    const msgstreamNode: INodeTreeStructure = {
      service: ENodeService.msgstream,
      type: ENodeType.overview,
      label: 'MsgStream',
      healthyStatus: rateList2healthyStatus(prometheusData.msgstream),
      children: [],
    };
    const objstorageNode: INodeTreeStructure = {
      service: ENodeService.objstorage,
      type: ENodeType.overview,
      label: 'ObjStorage',
      healthyStatus: rateList2healthyStatus(prometheusData.msgstream),
      children: [],
    };

    // internal
    const rootNode = {};
    const indexNodes: INodeTreeStructure[] = prometheusData.indexNodes.map(
      node => {
        const healthyStatus = d3.range(length).map((_, i: number) => {
          const cpu = node.cpu[i];
          const memory = node.memory[i];
          return cpu >= threshold.cpu || memory >= threshold.memory
            ? EHealthyStatus.warning
            : EHealthyStatus.healthy;
        });
        return {
          service: ENodeService.index,
          type: node.type === 'coord' ? ENodeType.coord : ENodeType.node,
          label: node.pod,
          healthyStatus,
          cpu: node.cpu,
          memory: node.memory,
          children: [],
        };
      }
    );
    const healthyStatus = d3
      .range(length)
      .map((_, i: number) =>
        indexNodes.reduce(
          (acc, cur) => acc && cur.healthyStatus[i] === EHealthyStatus.healthy,
          true
        )
          ? EHealthyStatus.healthy
          : EHealthyStatus.warning
      );
    const indexNode: INodeTreeStructure = {
      service: ENodeService.index,
      type: ENodeType.overview,
      label: 'Index',
      healthyStatus,
      children: indexNodes,
    };
  };

  return (
    <div className={classes.root}>
      <div className={classes.mainView}>
        {/* <Topology
          tree={tree}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        ></Topology> */}
        <div style={{ height: '200px', width: '300px' }}></div>
      </div>
      <div
        className={clsx(
          classes.detailView,
          selectedNode ? classes.showDetailView : classes.hideDetailView
        )}
      ></div>
    </div>
  );
};

export default SystemHealthyView;
