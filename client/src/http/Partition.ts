import dayjs from 'dayjs';
import { LOADING_STATE } from '@/consts';
import {
  PartitionManageParam,
  PartitionParam,
  PartitionData,
} from '@/pages/partitions/Types';
import { formatNumber } from '@/utils';
import BaseModel from './BaseModel';

export class Partition extends BaseModel implements PartitionData {
  public id!: string;
  public name!: string;
  public rowCount!: string;
  public createdTime!: string;

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static URL_BASE = `/partitions`;

  static getPartitions(collectionName: string): Promise<Partition[]> {
    const path = this.URL_BASE;

    return super.findAll({ path, params: { collection_name: collectionName } });
  }

  static managePartition(param: PartitionManageParam) {
    const { collectionName, partitionName, type } = param;
    const path = this.URL_BASE;
    return super.create({
      path,
      data: {
        collection_name: collectionName,
        partition_name: partitionName,
        type,
      },
    });
  }

  static loadPartition(param: PartitionParam) {
    const { collectionName, partitionNames } = param;
    const path = `${this.URL_BASE}/load`;
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
    const path = `${this.URL_BASE}/release`;
    return super.update({
      path,
      data: {
        collection_name: collectionName,
        partition_names: partitionNames,
      },
    });
  }

  get partitionName() {
    return this.name === '_default' ? 'Default partition' : this.name;
  }

  get entityCount() {
    return formatNumber(Number(this.rowCount));
  }

  get status() {
    // @TODO replace mock data
    return LOADING_STATE.UNLOADED;
  }

  // Befor milvus-2.0-rc3  will return '0'.
  // If milvus is stable, we can remote this condition/
  get createdAt(): string {
    return this.createdTime && this.createdTime !== '0'
      ? dayjs(Number(this.createdTime)).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }
}
