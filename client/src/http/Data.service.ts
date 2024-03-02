import { LoadSampleParam } from '@/pages/dialogs/Types';
import { InsertDataParam, DeleteEntitiesReq } from '@/pages/collections/Types';
import { VectorSearchParam } from '@/types/SearchTypes';
import BaseModel from './BaseModel';

export class DataService extends BaseModel {
  static importSample(collectionName: string, param: LoadSampleParam) {
    return super.create<{ sampleFile: string }>({
      path: `/collections/${collectionName}/importSample`,
      data: param,
    });
  }

  static insertData(collectionName: string, param: InsertDataParam) {
    return super.create({
      path: `/collections/${collectionName}/insert`,
      data: param,
    });
  }

  static deleteEntities(collectionName: string, param: DeleteEntitiesReq) {
    return super.update({
      path: `/collections/${collectionName}/entities`,
      data: param,
    });
  }

  static flush(collectionName: string) {
    return super.update({
      path: `/milvus/flush`,
      data: {
        collection_names: [collectionName],
      },
    });
  }

  static emptyData(collectionName: string) {
    return super.update({
      path: `/collections/${collectionName}/empty`,
    });
  }

  static vectorSearchData(collectionName: string, params: VectorSearchParam) {
    return super.query({
      path: `/collections/${collectionName}/search`,
      data: params,
    });
  }
}
