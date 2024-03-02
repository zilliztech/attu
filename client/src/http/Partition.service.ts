import { PartitionManageParam, PartitionParam } from '@/pages/partitions/Types';
import BaseModel from './BaseModel';
import { PartitionData } from '@server/types';

export class PartitionService extends BaseModel {
  static getPartitions(collectionName: string) {
    const path = `/partitions`;

    return super.findAll<PartitionData[]>({
      path,
      params: { collection_name: collectionName },
    });
  }

  static managePartition(param: PartitionManageParam) {
    const { collectionName, partitionName, type } = param;
    return super.create({
      path: `/partitions`,
      data: {
        collection_name: collectionName,
        partition_name: partitionName,
        type,
      },
    });
  }

  static loadPartition(param: PartitionParam) {
    const { collectionName, partitionNames } = param;
    const path = `/partitions/load`;
    return super.update({
      path,
      data: {
        collection_name: collectionName,
        partition_names: partitionNames,
      },
    });
  }

  static releasePartition(param: PartitionParam) {
    const { collectionName, partitionNames } = param;
    const path = `/partitions/release`;
    return super.update({
      path,
      data: {
        collection_name: collectionName,
        partition_names: partitionNames,
      },
    });
  }
}
