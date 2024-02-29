import {
  DescribeIndexResponse,
  KeyValuePair,
  IndexDescription,
} from '@zilliz/milvus2-sdk-node';

export type MilvusIndex = IndexDescription & {
  indexType: string;
  metricType: KeyValuePair[];
  indexParameterPairs: KeyValuePair[];
};

export interface DescribeIndexRes extends DescribeIndexResponse {
  index_descriptions: MilvusIndex[];
}
