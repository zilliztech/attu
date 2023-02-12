import { useEffect, useState } from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { useInterval } from '../../hooks/SystemView';
import { PrometheusHttp } from '../../http/Prometheus';
import { ALL_ROUTER_TYPES } from '../../router/Types';

interface ITimeRangeOption {
  label: string;
  value: number;
  step: string;
}

const SystemHealthyView = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);

  const INTERVAL = 60000;
  const timeRangeOptions: ITimeRangeOption[] = [
    {
      label: '1h',
      value: 60 * 60 * 1000,
      step: '3m',
    },
    {
      label: '24h',
      value: 24 * 60 * 60 * 1000,
      step: '60m',
    },
    {
      label: '7d',
      value: 7 * 24 * 60 * 60 * 1000,
      step: '8h',
    },
  ];
  const [timeRange, setTimeRange] = useState<ITimeRangeOption>(
    timeRangeOptions[1]
  );
  const [nodes, setNodes] = useState<any>();

  const updateData = async () => {
    const curT = new Date().getTime();
    const result: any = await PrometheusHttp.getHealthyData({
      start: curT - timeRange.value,
      end: curT,
      step: timeRange.step,
    });
    console.log(result);
    setNodes(result.data);
  };

  useEffect(() => {
    updateData();
  }, []);

  useInterval(() => {
    console.log('interval');
    updateData();
  }, INTERVAL);

  return <div></div>;
};

export default SystemHealthyView;
