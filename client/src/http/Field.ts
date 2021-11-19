import { DataTypeStringEnum } from '../pages/collections/Types';
import { FieldData } from '../pages/schema/Types';
import BaseModel from './BaseModel';

export class FieldHttp extends BaseModel implements FieldData {
  data_type!: DataTypeStringEnum;
  fieldID!: string;
  type_params!: { key: string; value: string }[];
  is_primary_key!: true;
  name!: string;
  description!: string;
  autoID!: boolean;

  constructor(props: {}) {
    super(props);
    Object.assign(this, props);
  }

  static async getFields(collectionName: string): Promise<FieldHttp[]> {
    const path = `/collections/${collectionName}`;

    const res = await super.findAll({
      path,
      params: {},
    });

    return res.schema.fields.map((f: any) => new this(f));
  }

  get _fieldId() {
    return this.fieldID;
  }

  get _isPrimaryKey() {
    return this.is_primary_key;
  }

  get _isAutoId() {
    return this.autoID;
  }

  get _fieldName() {
    return this.name;
  }

  get _fieldType() {
    return this.data_type;
  }

  get _desc() {
    return this.description || '--';
  }

  get _dimension() {
    return this.type_params.find(item => item.key === 'dim')?.value || '--';
  }
}
