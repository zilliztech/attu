import { DataTypeStringEnum } from '../../pages/collections/Types';

export const formatValue = (value: string, type: string, operator: string) => {
  let conditionValue: string = ''; //
  switch (type) {
    case DataTypeStringEnum.VarChar:
      conditionValue = `"${value}"`;
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
          conditionValue = `${value}`;
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

  const regInt = /^\d+$/;
  const regFloat = /^\d+\.\d+$/;
  const regIntInterval = /^\[\d+(,\d+)*\]$/;
  const regFloatInterval = /^\[\d+\.\d+(,\d+\.\d+)*\]$/;
  const isIn = data.operator === 'in';

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
        ? regFloatInterval.test(data.value)
        : regFloat.test(data.value);
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
    default:
      isLegal = false;
      break;
  }

  return isLegal;
};
