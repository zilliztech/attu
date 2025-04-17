import { DataTypeStringEnum } from '@/consts';

export const formatValue = (value: string, type: string, operator: string) => {
  switch (type) {
    case DataTypeStringEnum.VarChar:
      if (operator === 'in' || operator === 'not in') {
        return `${value}`;
      }
      return `"${value}"`;
    case DataTypeStringEnum.JSON:
      switch (operator) {
        case '<':
        case '>':
        case '==':
        case '>=':
        case '<=':
        case 'JSON_CONTAINS':
        case 'ARRAY_CONTAINS':
          return `${value}`;
        case 'in':
        case 'not in':
        case 'ARRAY_CONTAINS_ALL':
        case 'ARRAY_CONTAINS_ANY':
        case 'JSON_CONTAINS_ALL':
        case 'JSON_CONTAINS_ANY':
          return `[${value}]`;
        default:
          return `"${value}"`;
      }
    default:
      return value;
  }
};

export const checkValue = (data: any): boolean => {
  const regInt = /^-?\d+$/;
  const regNumber = /^-?\d+(\.\d+)?$/;
  const regNumberInterval = /^\[(-?\d+(\.\d+)?)(,(-?\d+(\.\d+)?))*\]$/;
  const regIntInterval = /^\[-?\d+(,-?\d+)*\]$/;
  const isIn = data.operator === 'in' || data.operator === 'not in';

  switch (data.type) {
    case DataTypeStringEnum.Int8:
    case DataTypeStringEnum.Int16:
    case DataTypeStringEnum.Int32:
    case DataTypeStringEnum.Int64:
      return isIn
        ? regIntInterval.test(data.value)
        : regInt.test(data.value);
    case DataTypeStringEnum.Float:
    case DataTypeStringEnum.Double:
    case DataTypeStringEnum.FloatVector:
      return isIn
        ? regNumberInterval.test(data.value)
        : regNumber.test(data.value);
    case DataTypeStringEnum.Bool:
      return ['false', 'true'].includes(data.value);
    case DataTypeStringEnum.VarChar:
    case DataTypeStringEnum.Array:
      return data.value !== '';
    case DataTypeStringEnum.JSON: {
      let type = DataTypeStringEnum.VarChar;
      if (
        data.operator === '>' ||
        data.operator === '<' ||
        data.operator === '>=' ||
        data.operator === '<='
      ) {
        type = DataTypeStringEnum.Int64;
      }
      return checkValue({
        value: data.value,
        type,
        operator: data.operator,
      });
    }
    default:
      return false;
  }
};
