export interface ITimeRangeOption {
  label: string;
  value: number;
  step: number;
}

export enum ENodeType {
  overview = 0,
  coord = 'coord',
  node = 'node',
}

export enum ENodeService {
  milvus = 0,
  meta = 'Meta',
  msgstream = 'MsgStream',
  objstorage = 'ObjStorage',
  root = 'Root',
  query = 'Query',
  index = 'Index',
  data = 'Data',
}

export interface ILineChartData {
  label: string;
  data: number[];
  format?: (d: number) => string;
  unit?: string;
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
  noData = 0,
  healthy,
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
