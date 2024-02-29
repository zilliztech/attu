import BaseModel from './BaseModel';
import {
  GetQuerySegmentInfoResponse,
  GePersistentSegmentInfoResponse,
} from '@server/types';

export class SegementService extends BaseModel {
  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static getQSegments(collectionName: string) {
    return super.search<GetQuerySegmentInfoResponse>({
      path: `/collections/${collectionName}/qsegments`,
      params: {},
    });
  }

  static getPSegments(collectionName: string) {
    return super.search<GePersistentSegmentInfoResponse>({
      path: `/collections/${collectionName}/psegments`,
      params: {},
    });
  }

  static compact(collectionName: string) {
    return super.update({
      path: `/collections/${collectionName}/compact`,
    });
  }
}
