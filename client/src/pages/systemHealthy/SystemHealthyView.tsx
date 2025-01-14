import { useEffect, useMemo, useState } from 'react';
import { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigationHook, useInterval } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import {
  LAST_TIME_HEALTHY_THRESHOLD_CPU,
  LAST_TIME_HEALTHY_THRESHOLD_MEMORY,
  DEFAULT_HEALTHY_THRESHOLD_CPU,
  DEFAULT_HEALTHY_THRESHOLD_MEMORY,
} from '@/consts';
import {
  ENodeService,
  ILineChartData,
  INodeTreeStructure,
  IPrometheusAllData,
  IThreshold,
  ITimeRangeOption,
} from './Types';
import Topology from './Topology';
import { reconNodeTree } from './dataHandler';
import HealthyIndexOverview from './HealthyIndexOverview';
import { timeRangeOptions } from './consts';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: '16px 40px',
    position: 'relative',
    height: '88%',
    display: 'flex',
    flexDirection: 'column',
  },
  mainView: {
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    height: '100%',
  },
}));

const SystemHealthyView = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);

  const classes = getStyles();

  const INTERVAL = 60000;
  const [timeRange, setTimeRange] = useState<ITimeRangeOption>(
    timeRangeOptions[2]
  );

  const [threshold, setThreshold] = useState<IThreshold>({
    cpu: +(
      window.localStorage.getItem(LAST_TIME_HEALTHY_THRESHOLD_CPU) ||
      DEFAULT_HEALTHY_THRESHOLD_CPU
    ),
    memory: +(
      window.localStorage.getItem(LAST_TIME_HEALTHY_THRESHOLD_MEMORY) ||
      DEFAULT_HEALTHY_THRESHOLD_MEMORY
    ),
  });
  const changeThreshold = (threshold: IThreshold) => {
    window.localStorage.setItem(
      LAST_TIME_HEALTHY_THRESHOLD_CPU,
      `${threshold.cpu}`
    );
    window.localStorage.setItem(
      LAST_TIME_HEALTHY_THRESHOLD_MEMORY,
      `${threshold.memory}`
    );
    setThreshold(threshold);
  };
  const [prometheusData, setPrometheusData] = useState<IPrometheusAllData>();
  const nodeTree = useMemo<INodeTreeStructure>(
    () =>
      prometheusData
        ? reconNodeTree(prometheusData, threshold)
        : ({
            children: [] as INodeTreeStructure[],
          } as INodeTreeStructure),
    [prometheusData, threshold]
  );

  const { t: prometheusTrans } = useTranslation('prometheus');
  const lineChartsData = useMemo<ILineChartData[]>(
    () =>
      prometheusData
        ? [
            {
              label: prometheusTrans('totalCount'),
              data: prometheusData.totalVectorsCount,
            },
            {
              label: prometheusTrans('searchCount'),
              data: prometheusData.searchVectorsCount,
            },
            {
              label: prometheusTrans('searchLatency'),
              data: prometheusData.sqLatency,
              format: d => d.toFixed(0),
              unit: 'ms',
            },
          ]
        : [],
    [prometheusData]
  );

  const hasDetailServices = [
    ENodeService.index,
    ENodeService.query,
    ENodeService.data,
  ];

  const [selectedService, setSelectedService] = useState<ENodeService>(
    ENodeService.root
  );

  const selectedNode = useMemo<INodeTreeStructure>(() => {
    if (hasDetailServices.indexOf(selectedService) >= 0) {
      return nodeTree.children.find(
        node => node.service === selectedService
      ) as INodeTreeStructure;
    } else return nodeTree;
  }, [selectedService, nodeTree]);

  return (
    <div className={classes.root}>
      {!!prometheusData && (
        <div className={classes.mainView}>
          <Topology
            nodeTree={nodeTree}
            selectedService={selectedService}
            onClick={setSelectedService}
          />

          <HealthyIndexOverview
            selectedNode={selectedNode}
            lineChartsData={lineChartsData}
            threshold={threshold}
            setThreshold={changeThreshold}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            setSelectedService={setSelectedService}
          />
        </div>
      )}
    </div>
  );
};

export default SystemHealthyView;
