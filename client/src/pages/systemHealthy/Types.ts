export interface ITimeRangeOption {
  label: string;
  value: number;
  step: number;
}

export enum ENodeType {
  overview = 0,
  coord,
  node,
}

export enum ENodeService {
  milvus = 0,
  meta,
  msgstream,
  objstorage,
  root,
  query,
  index,
  node,
}

export interface INodeTreeStructure {
  service: ENodeService;
  type: ENodeType;
  label: string;
  healthyStatus: EHealthyStatus[];
  cpu?: number[];
  memory?: number[];
  children: INodeTreeStructure[];
}

export enum EHealthyStatus {
  healthy = 0,
  warning,
  failed,
}

export interface IPrometheusNode {
  type: string;
  pod: string;
  cpu: number[];
  memory: number[];
}

export interface IPrometheusAllData {
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

export interface IThreshold {
  cpu: number;
  memory: number;
}