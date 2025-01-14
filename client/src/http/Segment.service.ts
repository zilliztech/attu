import BaseModel from './BaseModel';
import type {
  QuerySegmentObjects,
  PersistentSegmentObjects,
} from '@server/types';

export class SegmentService extends BaseModel {
  static getQSegments(collectionName: string) {
    return super.search<QuerySegmentObjects>({
      path: `/collections/${collectionName}/qsegments`,
      params: {},
    });
  }

  static getPSegments(collectionName: string) {
    return super.search<PersistentSegmentObjects>({
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
