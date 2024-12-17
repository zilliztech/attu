import { isSparseVector, transformObjStrToJSONStr } from '@/utils';
import { FieldObject } from '@server/types';
import { DataTypeStringEnum } from '@/consts';

const floatVectorValidator = (text: string, field: FieldObject) => {
  try {
    const value = JSON.parse(text);
    const dim = field.dimension;
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: `Not an array`,
      };
    }

    if (Array.isArray(value) && value.length !== dim) {
      return {
        valid: false,
        value: undefined,
        message: `Dimension ${value.length} is not equal to ${dim} `,
      };
    }

    return { valid: true, message: ``, value: value };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Float Vector format, it should be an array of ${field.dimension} numbers`,
    };
  }
};

const binaryVectorValidator = (text: string, field: FieldObject) => {
  try {
    const value = JSON.parse(text);
    const dim = field.dimension;
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: `Not an array`,
      };
    }

    if (Array.isArray(value) && value.length !== dim / 8) {
      return {
        valid: false,
        value: undefined,
        message: `Dimension ${value.length} is not equal to ${dim / 8} `,
      };
    }

    return { valid: true, message: ``, value: value };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Binary Vector format, it should be an array of ${
        field.dimension / 8
      } numbers`,
    };
  }
};

const sparseVectorValidator = (text: string, field: FieldObject) => {
  if (!isSparseVector(text)) {
    return {
      valid: false,
      value: undefined,
      message: `Incorrect Sparse Vector format, it should be like {1: 0.1, 3: 0.2}`,
    };
  }
  try {
    JSON.parse(transformObjStrToJSONStr(text));
    return {
      valid: true,
      message: ``,
    };
  } catch (e: any) {
    return {
      valid: false,
      message: `Wrong Sparse Vector format`,
    };
  }
};

export const Validator = {
  [DataTypeStringEnum.FloatVector]: floatVectorValidator,
  [DataTypeStringEnum.BinaryVector]: binaryVectorValidator,
  [DataTypeStringEnum.Float16Vector]: floatVectorValidator,
  [DataTypeStringEnum.BFloat16Vector]: floatVectorValidator,
  [DataTypeStringEnum.SparseFloatVector]: sparseVectorValidator,
};
