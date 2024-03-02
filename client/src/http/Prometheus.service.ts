import BaseModel from './BaseModel';

export class PrometheusService extends BaseModel {
  static SET_PROMETHEUS_URL = '/prometheus/setPrometheus';
  static GET_MILVUS_HEALTHY_DATA_URL = '/prometheus/getMilvusHealthyData';

  static setPrometheus({
    prometheusAddress,
    prometheusInstance,
    prometheusNamespace,
  }: {
    prometheusAddress: string;
    prometheusInstance: string;
    prometheusNamespace: string;
  }) {
    return super.search({
      path: PrometheusService.SET_PROMETHEUS_URL,
      params: { prometheusAddress, prometheusInstance, prometheusNamespace },
      timeout: 1000,
    });
  }

  static getHealthyData({
    start,
    end,
    step,
  }: {
    start: number;
    end: number;
    step: number;
  }) {
    return super.search({
      path: PrometheusService.GET_MILVUS_HEALTHY_DATA_URL,
      params: { start, end, step },
    });
  }
}
