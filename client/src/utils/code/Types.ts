import { IndexExtraParam } from '../../pages/schema/Types';
export interface CreateIndexCodeParam {
  collectionName: string;
  fieldName: string;
  indexName: string;
  extraParams: IndexExtraParam;
  isScalarField: boolean;
}
