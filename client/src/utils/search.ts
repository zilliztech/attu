import { Field } from '../components/advancedSearch/Types';
import { DataTypeEnum, DataTypeStringEnum } from '../pages/collections/Types';
import {
  FieldData,
  IndexType,
  IndexView,
  INDEX_TYPES_ENUM,
} from '../pages/schema/Types';
import { FieldOption } from '../types/SearchTypes';

/**
 * function to get EmbeddingType
 * @param fieldType only vector type fields: 'BinaryVector' or 'FloatVector'
 */
export const getEmbeddingType = (
  fieldType: DataTypeStringEnum
): DataTypeEnum.BinaryVector | DataTypeEnum.FloatVector => {
  const type =
    fieldType === 'BinaryVector'
      ? DataTypeEnum.BinaryVector
      : DataTypeEnum.FloatVector;
  return type;
};

/**
 * function to get default index type according to embedding type
 * use FLAT as default float index type, BIN_FLAT as default binary index type
 * @param embeddingType float or binary
 * @returns index type
 */
export const getDefaultIndexType = (embeddingType: DataTypeEnum): IndexType => {
  const defaultIndexType =
    embeddingType === DataTypeEnum.FloatVector
      ? INDEX_TYPES_ENUM.FLAT
      : INDEX_TYPES_ENUM.BIN_FLAT;
  return defaultIndexType;
};

/**
 * funtion to divide fields into two categories: vector or nonVector
 */
export const classifyFields = (
  fields: FieldData[]
): { vectorFields: FieldData[]; nonVectorFields: FieldData[] } => {
  const vectorTypes: DataTypeStringEnum[] = [
    DataTypeStringEnum.BinaryVector,
    DataTypeStringEnum.FloatVector,
  ];
  return fields.reduce(
    (result, cur) => {
      const changedFieldType = vectorTypes.includes(cur._fieldType)
        ? 'vectorFields'
        : 'nonVectorFields';

      result[changedFieldType].push(cur);

      return result;
    },
    { vectorFields: [] as FieldData[], nonVectorFields: [] as FieldData[] }
  );
};

export const getVectorFieldOptions = (
  fields: FieldData[],
  indexes: IndexView[]
): FieldOption[] => {
  const options: FieldOption[] = fields.map(f => {
    const embeddingType = getEmbeddingType(f._fieldType);
    const defaultIndex = getDefaultIndexType(embeddingType);
    const index = indexes.find(i => i._fieldName === f._fieldName);

    return {
      label: `${f._fieldName} (${index?._indexType || defaultIndex})`,
      value: f._fieldName,
      fieldType: f._fieldType,
      indexInfo: index || null,
      dimension: Number(f._dimension),
    };
  });

  return options;
};

export const getNonVectorFieldsForFilter = (fields: FieldData[]): Field[] => {
  return fields.map(f => ({
    name: f._fieldName,
    type: f._fieldType,
  }));
};
