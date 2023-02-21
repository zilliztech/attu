import * as d3 from 'd3';
import {
  EHealthyStatus,
  ENodeService,
  ENodeType,
  INodeTreeStructure,
  IPrometheusAllData,
  IPrometheusNode,
  IThreshold,
} from './Types';

export const getInternalNode = (
  prometheusNodes: IPrometheusNode[],
  service: ENodeService,
  label: string,
  threshold: IThreshold
) => {
  const length = prometheusNodes[0].cpu.length;
  const nodes = prometheusNodes.map(node => {
    const healthyStatus = d3.range(length).map((_, i: number) => {
      const cpu = node.cpu[i];
      const memory = node.memory[i];
      if (cpu === -1) return EHealthyStatus.noData;
      if (cpu === -2) return EHealthyStatus.failed;
      return cpu >= threshold.cpu || memory >= threshold.memory
        ? EHealthyStatus.warning
        : EHealthyStatus.healthy;
    });
    return {
      service: service,
      type: node.type === 'coord' ? ENodeType.coord : ENodeType.node,
      label: node.pod,
      healthyStatus,
      cpu: node.cpu,
      memory: node.memory,
      children: [],
    };
  });
  const overviewHealthyStatus = d3.range(length).map((_, i: number) => {
    if (nodes.find(node => node.healthyStatus[i] === EHealthyStatus.failed))
      return EHealthyStatus.failed;
    if (nodes.find(node => node.healthyStatus[i] === EHealthyStatus.warning))
      return EHealthyStatus.warning;
    if (nodes.find(node => node.healthyStatus[i] === EHealthyStatus.healthy))
      return EHealthyStatus.healthy;
    return EHealthyStatus.noData;
  });
  const overviewNode = {
    service,
    type: ENodeType.overview,
    label: label,
    healthyStatus: overviewHealthyStatus,
    children: nodes,
  };
  return overviewNode;
};

export const reconNodeTree = (
  prometheusData: IPrometheusAllData,
  threshold: IThreshold
) => {
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
    healthyStatus: rateList2healthyStatus(prometheusData.objstorage),
    children: [],
  };

  // internal
  const rootNode = getInternalNode(
    prometheusData.rootNodes,
    ENodeService.root,
    'Root',
    threshold
  );
  const indexNode = getInternalNode(
    prometheusData.indexNodes,
    ENodeService.index,
    'Index',
    threshold
  );
  const queryNode = getInternalNode(
    prometheusData.queryNodes,
    ENodeService.query,
    'Query',
    threshold
  );
  const dataNode = getInternalNode(
    prometheusData.dataNodes,
    ENodeService.data,
    'Data',
    threshold
  );

  return {
    service: ENodeService.milvus,
    type: ENodeType.overview,
    label: 'Overview',
    healthyStatus: [],
    children: [
      rootNode,
      indexNode,
      queryNode,
      dataNode,
      metaNode,
      msgstreamNode,
      objstorageNode,
    ],
  } as INodeTreeStructure;
};

export const THIRD_PARTY_SERVICE_HEALTHY_THRESHOLD = 0.95;
export const getThirdPartyServiceHealthyStatus = (rate: number) => {
  if (rate === -1) return EHealthyStatus.noData;
  if (rate > THIRD_PARTY_SERVICE_HEALTHY_THRESHOLD)
    return EHealthyStatus.healthy;
  return EHealthyStatus.failed;
};
export const rateList2healthyStatus = (rateList: number[]) =>
  rateList.map((rate: number) => getThirdPartyServiceHealthyStatus(rate));
