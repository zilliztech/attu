import BaseModel from './BaseModel';
import { KeyValuePair } from '@server/types';
import { DataTypeStringEnum } from '@/consts';

export class FieldHttp extends BaseModel {
  fieldID!: string;
  type_params!: { key: string; value: string }[];
  is_primary_key!: true;
  is_partition_key!: false;
  name!: string;
  description!: string;
  autoID!: boolean;
  data_type!: DataTypeStringEnum;
  element_type!: DataTypeStringEnum;
  index_params!: KeyValuePair[];
  createIndexDisabled?: boolean = false;
  indexType: string = '';
  indexName: string = '';
  indexParameterPairs: { key: string; value: string }[] = [];

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  get isPrimaryKey() {
    return this.is_primary_key;
  }

  get isPartitionKey() {
    return this.is_partition_key;
  }

  get isAutoId() {
    return this.autoID;
  }

  get fieldType() {
    return this.data_type;
  }

  get desc() {
    return this.description || '--';
  }

  get dimension() {
    return this.type_params.find(item => item.key === 'dim')?.value || '';
  }

  get maxLength() {
    return (
      this.type_params.find(item => item.key === 'max_length')?.value || ''
    );
  }
  get maxCapacity() {
    return (
      this.type_params.find(item => item.key === 'max_capacity')?.value || ''
    );
  }
}
