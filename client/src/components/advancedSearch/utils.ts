import { DataTypeStringEnum } from '@/consts';

export const formatValue = (value: string, type: string, operator: string) => {
  let conditionValue: string = ''; //
  switch (type) {
    case DataTypeStringEnum.VarChar:
      switch (operator) {
        case 'in':
        case 'not in':
          conditionValue = `${value}`;
          break;
        default:
          conditionValue = `"${value}"`;
          break;
      }
      break;
    case DataTypeStringEnum.JSON:
      switch (operator) {
        case '<':
        case '>':
        case '==':
        case '>=':
        case '<=':
          conditionValue = value;
          break;
        case 'in':
        case 'not in':
          conditionValue = `[${value}]`;
          break;
        case 'JSON_CONTAINS':
        case 'ARRAY_CONTAINS':
          conditionValue = `${value}`;
          break;
        case 'ARRAY_CONTAINS_ALL':
        case 'ARRAY_CONTAINS_ANY':
          conditionValue = `[${value}]`;
          break;
        case 'JSON_CONTAINS_ALL':
        case 'JSON_CONTAINS_ANY':
          conditionValue = `[${value}]`;
          break;
        default:
          conditionValue = `"${value}"`;
          break;
      }
      break;
    default:
      conditionValue = value;
  }

  return conditionValue;
};

export const checkValue = (data: any): boolean => {
  let isLegal = false;

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
      // case DataTypeStringEnum:
      isLegal = isIn
        ? regIntInterval.test(data.value)
        : regInt.test(data.value);
      break;
    case DataTypeStringEnum.Float:
    case DataTypeStringEnum.Double:
    case DataTypeStringEnum.FloatVector:
      isLegal = isIn
        ? regNumberInterval.test(data.value)
        : regNumber.test(data.value);
      break;
    case DataTypeStringEnum.Bool:
      const legalValues = ['false', 'true'];
      isLegal = legalValues.includes(data.value);
      break;
    case DataTypeStringEnum.VarChar:
      isLegal = data.value !== '';
      break;
    case DataTypeStringEnum.JSON:
      let type = DataTypeStringEnum.VarChar;
      switch (data.operator) {
        case '>':
        case '<':
        case '>=':
        case '<=':
          type = DataTypeStringEnum.Int64;
      }

      isLegal = checkValue({
        value: data.value,
        type: type,
        operator: data.operator,
      });
      break;
    case DataTypeStringEnum.Array:
      isLegal = data.value !== '';
      break;
    default:
      isLegal = false;
      break;
  }

  return isLegal;
};
