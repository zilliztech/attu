import { StatusEnum } from '../components/status/Types';
import { PartitionView } from '../pages/partitions/Types';
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

  static getPartitions(collectionName: string): Promise<PartitionHttp[]> {
    const path = '/partitions';

    return super.findAll({ path, params: { collection_name: collectionName } });
  }

  get _id() {
    return this.id;
  }

  get _name() {
    return this.name;
  }

  get _rowCount() {
    return formatNumber(Number(this.rowCount));
  }

  get _status() {
    // @TODO replace mock data
    return StatusEnum.unloaded;
  }
}
