import { IndexExtraParam } from '../../pages/databases/collections/schema/Types';
export interface CreateIndexCodeParam {
  collectionName: string;
  fieldName: string;
  indexName: string;
  extraParams: IndexExtraParam;
  isScalarField: boolean;
  metricType: string;
  indexType: string;
}
