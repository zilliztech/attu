import { IndexExtraParam } from '../../pages/databases/collections/overview/Types';
export interface CreateIndexCodeParam {
  collectionName: string;
  fieldName: string;
  indexName: string;
  extraParams: IndexExtraParam;
  isScalarField: boolean;
  metricType: string;
  indexType: string;
}
