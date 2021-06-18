import { StatusEnum } from '../components/status/Types';
import { PartitionManageParam, PartitionView } from '../pages/partitions/Types';
import { formatNumber } from '../utils/Common';
import BaseModel from './BaseModel';

export class PartitionHttp extends BaseModel implements PartitionView {
  id!: string;
  name!: string;
  rowCount!: string;
  status!: StatusEnum;

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static URL_BASE = `/partitions`;

  static getPartitions(collectionName: string): Promise<PartitionHttp[]> {
    const path = this.URL_BASE;

    return super.findAll({ path, params: { collection_name: collectionName } });
  }

  static createPartition(createParam: PartitionManageParam) {
    const { collectionName, partitionName, type } = createParam;
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

  get _id() {
    return this.id;
  }

  get _name() {
    return this.name === '_default' ? 'Default partition' : this.name;
  }

  get _rowCount() {
    return formatNumber(Number(this.rowCount));
  }

  get _status() {
    // @TODO replace mock data
    return StatusEnum.unloaded;
  }
}
