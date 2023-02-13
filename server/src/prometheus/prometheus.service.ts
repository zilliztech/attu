import axios from 'axios';
import { threadId } from 'worker_threads';

interface IPrometheusNode {
  label: string;
  pod: string;
  cpu: number[];
  memory: number[];
}

interface IPrometheusAllData {
  totalVectorsCount: number[];
  searchVectorsCount: number[];
  searchFailedVectorsCount: number[];
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
        // console.log(err);
        return { status: 'failed' };
      });
    return result;
  }

  async getSearchVectorsCount(start: number, end: number, step: string) {
    const expr = `${searchVectorsCountMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result[0].values.map((d: any) => +d[1]).slice(1);
  }

  async getInsertVectorsCount(start: number, end: number, step: string) {
    const expr = `${totalVectorsCountMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result[0].values.map((d: any) => +d[1]).slice(1);
  }

  getSQLatency() {
    return;
  }

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

  async getInternalNodesCPUData(start: number, end: number, step: string) {
    const expr = `${cpuMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result;
  }

  async getInternalNodesMemoryData(start: number, end: number, step: string) {
    const expr = `${memoryMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result;
  }

  reconstructNodeData(
    cpuNodesData: any,
    memoryNodesData: any,
    label: string
  ): IPrometheusNode[] {
    const cpuNodes = cpuNodesData.filter(
      (d: any) => d.metric.container.indexOf(label) >= 0
    );
    const memoryNodes = memoryNodesData.filter(
      (d: any) => d.metric.container.indexOf(label) >= 0
    );
    const nodesData = cpuNodes.map((d: any) => {
      const label = d.metric.container.indexOf('coord') >= 0 ? 'coord' : 'node';
      const pod = d.metric.pod;
      const cpuProcessTotal = d.values.map((v: any) => +v[1]);
      const step =
        (d.values[d.values.length - 1][0] - d.values[0][0]) /
        (d.values.length - 1);
      const cpu = cpuProcessTotal
        .map((v: number, i: number) => (i > 0 ? v - cpuProcessTotal[i - 1] : 0))
        .slice(1)
        .map((v: number) => v / step);

      const memory = memoryNodes
        .find((data: any) => data.metric.pod === pod)
        .values.map((v: any) => +v[1])
        .slice(1);
      return { label, pod, cpu, memory } as IPrometheusNode;
    });

    return nodesData;
  }

  async getInternalNodesData(start: number, end: number, step: string) {
    const cpuNodes = await this.getInternalNodesCPUData(start, end, step);
    const memoryNodes = await this.getInternalNodesMemoryData(start, end, step);

    const queryNodes = this.reconstructNodeData(cpuNodes, memoryNodes, 'query');
    const indexNodes = this.reconstructNodeData(cpuNodes, memoryNodes, 'index');
    const dataNodes = this.reconstructNodeData(cpuNodes, memoryNodes, 'data');
    return { queryNodes, indexNodes, dataNodes };
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
    const totalVectorsCount = await this.getInsertVectorsCount(
      start,
      end,
      step
    );
    const searchVectorsCount = await this.getSearchVectorsCount(
      start,
      end,
      step
    );
    const sqLatency: number[] = [];

    const cpuNodes = await this.getInternalNodesCPUData(start, end, step);
    const memoryNodes = await this.getInternalNodesMemoryData(start, end, step);

    const rootNodes: IPrometheusNode[] = [
      {
        label: 'coord',
        pod: cpuNodes.find((node: any) => node.metric.container === 'rootcoord')
          .metric.pod,
        cpu: cpuNodes
          .find((node: any) => node.metric.container === 'rootcoord')
          .values.map((d: any) => +d[1]),
        memory: memoryNodes
          .find((node: any) => node.metric.container === 'rootcoord')
          .values.map((d: any) => +d[1]),
      },
    ];
    const { queryNodes, indexNodes, dataNodes } =
      await this.getInternalNodesData(start, end, step);

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
    };
  }
}
