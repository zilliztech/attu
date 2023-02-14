import BaseModel from './BaseModel';

export class PrometheusHttp extends BaseModel {
  static SET_PROMETHEUS_URL = '/prometheus/setPrometheus';
  static GET_MILVUS_HEALTHY_DATA_URL = '/prometheus/getMilvusHealthyData';

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

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
      path: PrometheusHttp.SET_PROMETHEUS_URL,
      params: { prometheusAddress, prometheusInstance, prometheusNamespace },
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
      path: PrometheusHttp.GET_MILVUS_HEALTHY_DATA_URL,
      params: { start, end, step },
    });
  }
}
