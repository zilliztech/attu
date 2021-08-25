import { IndexExtraParam } from "../../pages/schema/Types";
export interface CreateIndexCodeParam {
  collectionName: string;
  fieldName: string;
  extraParams: IndexExtraParam
}
