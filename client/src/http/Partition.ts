import dayjs from 'dayjs';
import { LOADING_STATE } from '../consts/Milvus';
import {
  PartitionManageParam,
  PartitionParam,
  PartitionData,
} from '../pages/partitions/Types';
import { formatNumber } from '../utils/Common';
import BaseModel from './BaseModel';

export class PartitionHttp extends BaseModel implements PartitionData {
  private id!: string;
  private name!: string;
  private rowCount!: string;
  private createdTime!: string;

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static URL_BASE = `/partitions`;

  static getPartitions(collectionName: string): Promise<PartitionHttp[]> {
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

  get _id() {
    return this.id;
  }

  get _name() {
    return this.name;
  }

  get _formatName() {
    return this.name === '_default' ? 'Default partition' : this.name;
  }

  get _rowCount() {
    return formatNumber(Number(this.rowCount));
  }

  get _status() {
    // @TODO replace mock data
    return LOADING_STATE.UNLOADED
  }

  // Befor milvus-2.0-rc3  will return '0'.
  // If milvus is stable, we can remote this condition/
  get _createdTime(): string {
    return this.createdTime && this.createdTime !== '0'
      ? dayjs(Number(this.createdTime)).format('YYYY-MM-DD HH:mm:ss')
      : '';
  }
}
