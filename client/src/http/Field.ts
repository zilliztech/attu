import { DataType } from '../pages/collections/Types';
import { FieldView } from '../pages/structure/Types';
import { IndexState } from '../types/Milvus';
import BaseModel from './BaseModel';
import { IndexHttp } from './Index';

export class FieldHttp extends BaseModel implements FieldView {
  data_type!: DataType;
  fieldID!: string;
  type_params!: { key: string; value: string }[];
  is_primary_key!: true;
  name!: string;
  // data from index http
  _indexType!: string;
  _indexParameterPairs!: { key: string; value: string }[];
  _indexStatus!: IndexState;
  _createIndexDisabled!: boolean;

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

  static async getStructureListWithIndex(
    collectionName: string
  ): Promise<FieldHttp[]> {
    const vectorTypes: DataType[] = ['BinaryVector', 'FloatVector'];
    const indexList = await IndexHttp.getIndexInfo(collectionName);
    const structureList = [...(await this.getFields(collectionName))];
    let fields: FieldHttp[] = [];
    for (const structure of structureList) {
      if (vectorTypes.includes(structure.data_type)) {
        const index = indexList.find(i => i._fieldName === structure.name);
        structure._indexParameterPairs = index?._indexParameterPairs || [];
        structure._indexType = index?._indexType || '';
        structure._createIndexDisabled = indexList.length > 0;
      }

      fields = [...fields, structure];
    }
    return fields;
  }

  get _fieldId() {
    return this.fieldID;
  }

  get _isPrimaryKey() {
    return this.is_primary_key;
  }

  get _fieldName() {
    return this.name;
  }

  get _fieldType() {
    return this.data_type;
  }

  get _dimension() {
    return this.type_params.find(item => item.key === 'dim')?.value || '--';
  }
}
