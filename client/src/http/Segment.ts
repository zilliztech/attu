import BaseModel from './BaseModel';
import {
  GetQuerySegmentInfoResponse,
  QuerySegmentInfo,
  GePersistentSegmentInfoResponse,
  PersistentSegmentInfo,
} from '@server/types';

export class Segement extends BaseModel {
  static COLLECTIONS_URL = '/collections';

  infos!: QuerySegmentInfo[] | PersistentSegmentInfo[];

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static getQSegments(collectionName: string) {
    return super.search({
      path: `${this.COLLECTIONS_URL}/${collectionName}/qsegments`,
      params: {},
    }) as Promise<GetQuerySegmentInfoResponse>;
  }

  static getPSegments(collectionName: string) {
    return super.search({
      path: `${this.COLLECTIONS_URL}/${collectionName}/psegments`,
      params: {},
    }) as Promise<GePersistentSegmentInfoResponse>;
  }

  static compact(collectionName: string) {
    return super.update({
      path: `${this.COLLECTIONS_URL}/${collectionName}/compact`,
    });
  }
}
