import { LoadSampleParam } from '@/pages/dialogs/Types';
import { InsertDataParam, DeleteEntitiesReq } from '@/pages/collections/Types';
import BaseModel from './BaseModel';

export class DataService extends BaseModel {
  static COLLECTIONS_URL = '/collections';
  static FLUSH_URL = '/milvus/flush';

  sampleFile!: string;

  constructor(props: DataService) {
    super(props);
    Object.assign(this, props);
  }
  static importSample(collectionName: string, param: LoadSampleParam) {
    return super.create<DataService>({
      path: `${this.COLLECTIONS_URL}/${collectionName}/importSample`,
      data: param,
    });
  }

  static insertData(collectionName: string, param: InsertDataParam) {
    return super.create({
      path: `${this.COLLECTIONS_URL}/${collectionName}/insert`,
      data: param,
    });
  }

  static deleteEntities(collectionName: string, param: DeleteEntitiesReq) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/entities`,
      data: param,
    });
  }

  static flush(collectionName: string) {
    return super.update({
      path: this.FLUSH_URL,
      data: {
        collection_names: [collectionName],
      },
    });
  }
}
