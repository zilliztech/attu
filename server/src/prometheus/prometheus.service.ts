import axios from 'axios';

interface IPrometheusNode {
  label: string;
  cpu: number[];
  memory: number[];
}

interface IPrometheusAllData {
  totalVectorsCount: number[];
  searchVectorsCount: number[];
  searchFailedVectorsCount: number[];
  sqLatency: number[];

  metaHealthy: number[];
  msgHealthy: number[];
  objectHealthy: number[];

  queryNodes: IPrometheusNode[];
  indexNodes: IPrometheusNode[];
  dataNodes: IPrometheusNode[];
}

const metaMetric = 'milvus_meta_op_count';
const msgstreamMetric = 'milvus_msgstream_op_count';
const objstorageMetric = 'milvus_storage_op_count';

export class PrometheusService {
  static address: string = '';
  static instance: string = '';
  static namespace: string = '';
  static isReady: boolean = false;

  static get url() {
    return `http://${PrometheusService.address}`;
  }
  static get selector() {
    return (
      '{' +
      `app_kubernetes_io_instance="${PrometheusService.instance}"` +
      `,namespace="${PrometheusService.namespace}"` +
      '}'
    );
  }

  constructor() {
    // todo
  }

  async setPrometheus({
    prometheusAddress,
    prometheusInstance,
    prometheusNamespace,
  }: {
    prometheusAddress: string;
    prometheusInstance: string;
    prometheusNamespace: string;
  }) {
    PrometheusService.isReady = await this.checkPrometheus(prometheusAddress);
    if (PrometheusService.isReady) {
      PrometheusService.address = prometheusAddress;
      PrometheusService.instance = prometheusInstance;
      PrometheusService.namespace = prometheusNamespace;
    }

    return {
      isReady: PrometheusService.isReady,
    };
  }

  async checkPrometheus(prometheusAddress: string) {
    const result = await axios
      .get(`http://${prometheusAddress}/-/ready`)
      .then(res => res.status)
      .catch(err => {
        console.log(err);
      });
    return result === 200;
  }

  async queryRange(expr: string, start: number, end: number, step: string) {
    const url =
      PrometheusService.url +
      '/api/v1/query_range?query=' +
      expr +
      `&start=${new Date(+start).toISOString()}` +
      `&end=${new Date(+end).toISOString()}` +
      `&step=${step}`;
    console.log(url);
    const result = await axios
      .get(url)
      .then(res => res.data)
      .catch(err => {
        console.log(err);
        return { status: 'failed' };
      });
    return result;
  }

  getSearchVectorsCount() {
    return;
  }

  getInsertVectorsCount() {
    return;
  }

  getSQLatency() {
    return;
  }

  async getMetaServiceHealthyStatus(start: number, end: number, step: string) {}

  async getThirdPartyServiceHealthStatus(
    metricName: string,
    start: number,
    end: number,
    step: string
  ) {
    const expr = `sum by (status) (${metricName}${PrometheusService.selector})`;
    const result = await this.queryRange(expr, start, end, step);
    const totalCount = result.data.result
      .find((d: any) => d.metric.status === 'total')
      .values.map((d: any) => +d[1]);
    const totalSlices = totalCount
      .map((d: number, i: number) => (i > 0 ? d - totalCount[i - 1] : d))
      .slice(1);
    const successCount = result.data.result
      .find((d: any) => d.metric.status === 'success')
      .values.map((d: any) => +d[1]);
    const successSlices = successCount
      .map((d: number, i: number) => (i > 0 ? d - successCount[i - 1] : d))
      .slice(1);
    return totalSlices.map((d: number, i: number) =>
      d === 0 ? 1 : successSlices[i] / d
    );
  }

  getMessageServiceHealthyStatus() {
    return;
  }

  getObjectServiceHealthyStatus() {
    return;
  }

  getInternalNodeCPUData() {
    return;
  }

  getInternalNodeMemoryData() {
    return;
  }

  async getMilvusHealthyData({
    start,
    end,
    step,
  }: {
    start: number;
    end: number;
    step: string;
  }) {
    const meta = await this.getThirdPartyServiceHealthStatus(
      metaMetric,
      start,
      end,
      step
    );
    const msgstream = await this.getThirdPartyServiceHealthStatus(
      msgstreamMetric,
      start,
      end,
      step
    );
    const objstorage = await this.getThirdPartyServiceHealthStatus(
      objstorageMetric,
      start,
      end,
      step
    );
    return { meta, msgstream, objstorage } as any;
  }
}
