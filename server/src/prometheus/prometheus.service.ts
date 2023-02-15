import axios from 'axios';

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
      .then(res => res?.status === 200)
      .catch(err => {
        // console.log(err);
        return false;
      });
    return result;
  }

  async queryRange(expr: string, start: number, end: number, step: number) {
    const url =
      PrometheusService.url +
      '/api/v1/query_range?query=' +
      expr +
      `&start=${new Date(+start).toISOString()}` +
      `&end=${new Date(+end).toISOString()}` +
      `&step=${step / 1000}s`;
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

  async getVectorsCount(
    metric: string,
    start: number,
    end: number,
    step: number
  ) {
    const expr = `${metric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    const data = result.data.result;
    const length = Math.floor((end - start) / step);

    if (data.length === 0) return Array(length).fill(0);

    const res = result.data.result[0].values.map((d: any) => +d[1]).slice(1);

    let leftLossCount, rightLossCount;
    leftLossCount = Math.floor((data[0].values[0][0] * 1000 - start) / step);
    res.unshift(...Array(leftLossCount).fill(-1));
    rightLossCount = Math.floor(
      (end - data[0].values[data[0].values.length - 1][0] * 1000) / step
    );
    res.push(...Array(rightLossCount).fill(-2));
    return res;
  }
  getInsertVectorsCount = (start: number, end: number, step: number) =>
    this.getVectorsCount(totalVectorsCountMetric, start, end, step);

  async getSearchVectorsCount(start: number, end: number, step: number) {
    const expr = `${searchVectorsCountMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    const data = result.data.result;
    const length = Math.floor((end - start) / step);

    if (data.length === 0) return Array(length).fill(0);

    const totalCount = data[0].values.map((d: any) => +d[1]);
    const res = totalCount
      .map((d: number, i: number) => (i > 0 ? d - totalCount[i - 1] : d))
      .slice(1);

    let leftLossCount, rightLossCount;
    leftLossCount = Math.floor((data[0].values[0][0] * 1000 - start) / step);
    res.unshift(...Array(leftLossCount).fill(-1));
    rightLossCount = Math.floor(
      (end - data[0].values[data[0].values.length - 1][0] * 1000) / step
    );
    res.push(...Array(rightLossCount).fill(-2));
    return res;
  }

  async getSQLatency(start: number, end: number, step: number) {
    const expr =
      `histogram_quantile(0.99, sum by (le, pod, node_id)` +
      `(rate(${sqLatencyMetric}${PrometheusService.selector}[${
        step / 1000
      }s])))`;
    const result = await this.queryRange(expr, start, end, step);
    const data = result.data.result;

    const length = Math.floor((end - start) / step);
    if (data.length === 0) return Array(length).fill(0);

    const res = data[0].values
      .map((d: any) => (isNaN(d[1]) ? 0 : +d[1]))
      // .slice(1);
    let leftLossCount, rightLossCount;
    leftLossCount = Math.floor((data[0].values[0][0] * 1000 - start) / step);
    res.unshift(...Array(leftLossCount).fill(-1));
    rightLossCount = Math.floor(
      (end - data[0].values[data[0].values.length - 1][0] * 1000) / step
    );
    res.push(...Array(rightLossCount).fill(-2));
    return res;
  }

  async getThirdPartyServiceHealthStatus(
    metricName: string,
    start: number,
    end: number,
    step: number
  ) {
    const expr = `sum by (status) (${metricName}${PrometheusService.selector})`;
    const result = await this.queryRange(expr, start, end, step);
    const data = result.data.result;
    const length = Math.floor((end - start) / step);
    const totalCount = data
      .find((d: any) => d.metric.status === 'total')
      .values.map((d: any) => +d[1]);
    const totalSlices = totalCount
      .map((d: number, i: number) => (i > 0 ? d - totalCount[i - 1] : d))
      .slice(1);
    const successCount = data
      .find((d: any) => d.metric.status === 'success')
      .values.map((d: any) => +d[1]);
    const successSlices = successCount
      .map((d: number, i: number) => (i > 0 ? d - successCount[i - 1] : d))
      .slice(1);
    const res = totalSlices.map((d: number, i: number) =>
      d === 0 ? 1 : successSlices[i] / d
    );
    res.unshift(...Array(length - res.length).fill(-1));
    return res;
  }

  async getInternalNodesCPUData(start: number, end: number, step: number) {
    const expr = `${cpuMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result;
  }

  async getInternalNodesMemoryData(start: number, end: number, step: number) {
    const expr = `${memoryMetric}${PrometheusService.selector}`;
    const result = await this.queryRange(expr, start, end, step);
    return result.data.result;
  }

  reconstructNodeData(
    cpuNodesData: any,
    memoryNodesData: any,
    type: string,
    start: number,
    end: number,
    step: number
  ): IPrometheusNode[] {
    const cpuNodes = cpuNodesData.filter(
      (d: any) => d.metric.container.indexOf(type) >= 0
    );
    const memoryNodes = memoryNodesData.filter(
      (d: any) => d.metric.container.indexOf(type) >= 0
    );
    const nodesData = cpuNodes.map((d: any) => {
      const type = d.metric.container.indexOf('coord') >= 0 ? 'coord' : 'node';
      const pod = d.metric.pod;
      const cpuProcessTotal = d.values.map((v: any) => +v[1]);
      const cpu = cpuProcessTotal
        .map((v: number, i: number) => (i > 0 ? v - cpuProcessTotal[i - 1] : 0))
        .slice(1)
        .map((v: number) => v / (step / 1000));

      let leftLossCount, rightLossCount;
      leftLossCount = Math.floor((d.values[0][0] * 1000 - start) / step);
      cpu.unshift(...Array(leftLossCount).fill(-1));
      rightLossCount = Math.floor(
        (end - d.values[d.values.length - 1][0] * 1000) / step
      );
      cpu.push(...Array(rightLossCount).fill(-2));

      const node = memoryNodes.find((data: any) => data.metric.pod === pod);
      const memory = node.values.map((v: any) => +v[1]);

      leftLossCount = Math.floor((node.values[0][0] * 1000 - start) / step);
      memory.unshift(...Array(leftLossCount).fill(-1));
      rightLossCount = Math.floor(
        (end - node.values[node.values.length - 1][0] * 1000) / step
      );
      memory.push(...Array(rightLossCount).fill(-2));

      return { type, pod, cpu, memory: memory.slice(1) } as IPrometheusNode;
    });

    return nodesData;
  }

  async getInternalNodesData(start: number, end: number, step: number) {
    const cpuNodes = await this.getInternalNodesCPUData(start, end, step);
    const memoryNodes = await this.getInternalNodesMemoryData(start, end, step);

    const [rootNodes, queryNodes, indexNodes, dataNodes] = [
      'root',
      'query',
      'index',
      'data',
    ].map((metric: string) =>
      this.reconstructNodeData(cpuNodes, memoryNodes, metric, start, end, step)
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
    const sqLatency = await this.getSQLatency(start, end, step);
    const { rootNodes, queryNodes, indexNodes, dataNodes } =
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
    } as IPrometheusAllData;
  }
}
