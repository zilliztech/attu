import axios from 'axios';
import fillRangeData from './fillRangeData';

interface IPrometheusNode {
  type: string;
  pod: string;
  cpu: number[];
  memory: number[];
}

interface IPrometheusAllData {
  totalVectorsCount: number[];
  searchVectorsCount: number[];
  searchFailedVectorsCount?: number[];
  sqLatency: number[];

  meta: number[];
  msgstream: number[];
  objstorage: number[];

  rootNodes: IPrometheusNode[];
  queryNodes: IPrometheusNode[];
  indexNodes: IPrometheusNode[];
  dataNodes: IPrometheusNode[];
}

const metaMetric = 'milvus_meta_op_count';
const msgstreamMetric = 'milvus_msgstream_op_count';
const objstorageMetric = 'milvus_storage_op_count';

const totalVectorsCountMetric = 'milvus_proxy_insert_vectors_count';
const searchVectorsCountMetric = 'milvus_proxy_search_vectors_count';
const sqLatencyMetric = 'milvus_proxy_sq_latency_bucket';

const cpuMetric = 'process_cpu_seconds_total';
const memoryMetric = 'process_resident_memory_bytes';

const http = axios.create({
  timeout: 1000,
});

export class PrometheusService {
  static address: string = '';
  static instance: string = '';
  static namespace: string = '';
  static isReady: boolean = false;

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
    PrometheusService.isReady = await this.checkPrometheus(
      prometheusAddress,
      prometheusInstance,
      prometheusNamespace
    );
    if (PrometheusService.isReady) {
      PrometheusService.address = prometheusAddress;
      PrometheusService.instance = prometheusInstance;
      PrometheusService.namespace = prometheusNamespace;
    }

    return {
      isReady: PrometheusService.isReady,
    };
  }

  async checkPrometheus(
    prometheusAddress: string,
    prometheusInstance: string,
    prometheusNamespace: string
  ) {
    const addressValid = await http
      .get(`${prometheusAddress}/-/ready`)
      .then(res => res?.status === 200)
      .catch(err => {
        return false;
      });
    if (addressValid) {
      const url =
        `${prometheusAddress}/api/v1/query` +
        `?query=milvus_num_node{` +
        `app_kubernetes_io_instance="${prometheusInstance}",` +
        `namespace="${prometheusNamespace}"}`;
      const instanceValid = await http
        .get(url)
        .then(res => res?.data?.data?.result?.length > 0)
        .catch(err => {
          return false;
        });
      if (instanceValid) return true;
    }
    return false;
  }

  async queryRange(expr: string, start: number, end: number, step: number) {
    const url =
      PrometheusService.address +
      '/api/v1/query_range?query=' +
      expr +
      `&start=${new Date(+start).toISOString()}` +
      `&end=${new Date(+end).toISOString()}` +
      `&step=${step / 1000}s`;
    const result = await http.get(url).then(res => res.data);
    const data = result.data.result;
    fillRangeData(data, start, end, step);
    return data;
  }

  async getInsertVectorsCount(start: number, end: number, step: number) {
    const expr = `${totalVectorsCountMetric}${PrometheusService.selector}`;
    const data = await this.queryRange(expr, start, end, step);
    return data.length > 0 ? data[0].values : [];
  }

  async getSearchVectorsCount(start: number, end: number, step: number) {
    const expr = `delta(${searchVectorsCountMetric}${
      PrometheusService.selector
    }[${step / 1000}s])`;
    const data = await this.queryRange(expr, start, end, step);
    return data.length > 0
      ? data[0].values.map((d: number) => Math.round(d))
      : [];
  }

  async getSQLatency(start: number, end: number, step: number) {
    const expr =
      `histogram_quantile(0.99, sum by (le, pod, node_id)` +
      `(rate(${sqLatencyMetric}${PrometheusService.selector}[${
        step / 1000
      }s])))`;
    const data = await this.queryRange(expr, start, end, step);
    return data.length > 0 ? data[0].values : [];
  }

  async getThirdPartyServiceHealthStatus(
    metricName: string,
    start: number,
    end: number,
    step: number
  ) {
    const expr = `sum by (status) (delta(${metricName}${
      PrometheusService.selector
    }[${step / 1000}s]))`;
    const data = await this.queryRange(expr, start, end, step);

    const totalData =
      data.find((d: any) => d.metric.status === 'total')?.values || [];
    const successData =
      data.find((d: any) => d.metric.status === 'success')?.values || [];
    return totalData.map((d: number, i: number) =>
      d < 0 ? d : d === 0 ? 1 : successData[i] / d
    );
  }

  async getInternalNodesCPUData(start: number, end: number, step: number) {
    const expr = `rate(${cpuMetric}${PrometheusService.selector}[${
      step / 1000
    }s])`;
    return await this.queryRange(expr, start, end, step);
  }

  async getInternalNodesMemoryData(start: number, end: number, step: number) {
    const expr = `${memoryMetric}${PrometheusService.selector}`;
    return await this.queryRange(expr, start, end, step);
  }

  reconstructNodeData(
    cpuNodesData: any,
    memoryNodesData: any,
    type: string
  ): IPrometheusNode[] {
    const cpuNodes = cpuNodesData.filter(
      (d: any) => d.metric.container.indexOf(type) >= 0
    );
    const memoryNodes = memoryNodesData.filter(
      (d: any) => d.metric.container.indexOf(type) >= 0
    );
    const nodesData = cpuNodes.map((d: any) => {
      const nodeType =
        d.metric.container.indexOf('coord') >= 0 ? 'coord' : 'node';
      const pod = d.metric.pod;
      const cpu = d?.values || [];

      const node = memoryNodes.find((data: any) => data.metric.pod === pod);
      const memory = node ? node?.values || [] : [];

      return {
        type: nodeType,
        pod,
        cpu,
        memory,
      } as IPrometheusNode;
    });

    return nodesData;
  }

  async getInternalNodesData(start: number, end: number, step: number) {
    const [cpuNodes, memoryNodes] = await Promise.all([
      this.getInternalNodesCPUData(start, end, step),
      this.getInternalNodesMemoryData(start, end, step),
    ]);

    const [rootNodes, queryNodes, indexNodes, dataNodes] = [
      'root',
      'query',
      'index',
      'data',
    ].map((metric: string) =>
      this.reconstructNodeData(cpuNodes, memoryNodes, metric)
    );
    return { rootNodes, queryNodes, indexNodes, dataNodes };
  }

  async getMilvusHealthyData({
    start,
    end,
    step,
  }: {
    start: number;
    end: number;
    step: number;
  }) {
    if (!PrometheusService.isReady) {
      return {};
    }

    const [
      meta,
      msgstream,
      objstorage,
      totalVectorsCount,
      searchVectorsCount,
      sqLatency,
      { rootNodes, queryNodes, indexNodes, dataNodes },
    ] = await Promise.all([
      this.getThirdPartyServiceHealthStatus(metaMetric, start, end, step),
      this.getThirdPartyServiceHealthStatus(msgstreamMetric, start, end, step),
      this.getThirdPartyServiceHealthStatus(objstorageMetric, start, end, step),
      this.getInsertVectorsCount(start, end, step),
      this.getSearchVectorsCount(start, end, step),
      this.getSQLatency(start, end, step),
      this.getInternalNodesData(start, end, step),
    ]);

    return {
      totalVectorsCount,
      searchVectorsCount,
      sqLatency,

      meta,
      msgstream,
      objstorage,

      rootNodes,
      queryNodes,
      indexNodes,
      dataNodes,
    } as IPrometheusAllData;
  }
}
