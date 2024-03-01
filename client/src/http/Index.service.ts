import { IndexCreateParam, IndexManageParam } from '../pages/schema/Types';
import { ManageRequestMethods } from '../types/Common';
import BaseModel from './BaseModel';
import { DescribeIndexRes, IndexObject } from '@server/types';

export class IndexService extends BaseModel {
  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static async getIndexInfo(collectionName: string): Promise<IndexObject[]> {
    const res = await super.findAll<DescribeIndexRes>({
      path: `/schema/index`,
      params: { collection_name: collectionName },
    });
    return res.index_descriptions;
  }

  static async createIndex(param: IndexCreateParam) {
    const path = `/schema/index`;
    const type: ManageRequestMethods = ManageRequestMethods.CREATE;

    return super.create({
      path,
      data: { ...param, type },
    });
  }

  static async deleteIndex(param: IndexManageParam) {
    const path = `/schema/index`;
    const type: ManageRequestMethods = ManageRequestMethods.DELETE;

    return super.batchDelete({ path, data: { ...param, type } });
  }

  static async flush() {
    const path = `/schema/index/flush`;

    return super.query({ path, data: {} });
  }
}
