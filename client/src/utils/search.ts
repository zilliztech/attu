import { Field } from '../components/advancedSearch/Types';
import { IndexType } from '../pages/schema/Types';
import { INDEX_TYPES_ENUM, DataTypeEnum, DataTypeStringEnum } from '@/consts';
import { FieldOption } from '../types/SearchTypes';
import { IndexObject, FieldObject } from '@server/types';

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
  fields: FieldObject[]
): { vectorFields: FieldObject[]; nonVectorFields: FieldObject[] } => {
  const vectorTypes: DataTypeStringEnum[] = [
    DataTypeStringEnum.BinaryVector,
    DataTypeStringEnum.FloatVector,
  ];
  return fields.reduce(
    (result, cur) => {
      const changedFieldType = vectorTypes.includes(
        cur.data_type as DataTypeStringEnum
      )
        ? 'vectorFields'
        : 'nonVectorFields';

      result[changedFieldType].push(cur);

      return result;
    },
    { vectorFields: [] as FieldObject[], nonVectorFields: [] as FieldObject[] }
  );
};

export const getVectorFieldOptions = (
  fields: FieldObject[],
  index_descriptions: IndexObject[]
): FieldOption[] => {
  const options: FieldOption[] = fields.map(f => {
    const embeddingType = getEmbeddingType(f.data_type as DataTypeStringEnum);
    const defaultIndex = getDefaultIndexType(embeddingType);
    const index = index_descriptions.find(i => i.field_name === f.name);

    return {
      label: `${f.name} (${index?.indexType || defaultIndex})`,
      value: f.name,
      fieldType: f.data_type,
      indexInfo: index || null,
      dimension: Number(f.dimension),
    };
  });

  return options;
};

export const getNonVectorFieldsForFilter = (
  fields: FieldObject[]
): { name: string; type: string }[] => {
  return fields.map(f => ({
    name: f.name,
    type: f.data_type,
  }));
};
