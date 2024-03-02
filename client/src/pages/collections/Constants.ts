import { LabelValuePair } from '../../types/Common';
import { DataTypeEnum, ConsistencyLevelEnum } from '@/consts';

export const CONSISTENCY_LEVEL_OPTIONS: LabelValuePair[] = [
  {
    label: 'Strong',
    value: ConsistencyLevelEnum.Strong,
  },
  {
    label: 'Session',
    value: ConsistencyLevelEnum.Session,
  },
  {
    label: 'Bounded',
    value: ConsistencyLevelEnum.Bounded,
  },
  {
    label: 'Eventually',
    value: ConsistencyLevelEnum.Eventually,
  },
];

export const VECTOR_FIELDS_OPTIONS: LabelValuePair[] = [
  {
    label: 'Binary Vector',
    value: DataTypeEnum.BinaryVector,
  },
  {
    label: 'Float Vector',
    value: DataTypeEnum.FloatVector,
  },
];

export const ALL_OPTIONS: LabelValuePair[] = [
  // ...VECTOR_FIELDS_OPTIONS,
  {
    label: 'Int8',
    value: DataTypeEnum.Int8,
  },
  {
    label: 'Int16',
    value: DataTypeEnum.Int16,
  },
  {
    label: 'Int32',
    value: DataTypeEnum.Int32,
  },
  {
    label: 'Int64',
    value: DataTypeEnum.Int64,
  },
  {
    label: 'Float',
    value: DataTypeEnum.Float,
  },
  {
    label: 'Double',
    value: DataTypeEnum.Double,
  },
  {
    label: 'Boolean',
    value: DataTypeEnum.Bool,
  },
  {
    label: 'VarChar',
    value: DataTypeEnum.VarChar,
  },
  {
    label: 'JSON',
    value: DataTypeEnum.JSON,
  },
  {
    label: 'Array',
    value: DataTypeEnum.Array,
  },
];

export const AUTO_ID_OPTIONS: LabelValuePair[] = [
  {
    label: 'On',
    value: 'true',
  },
  {
    label: 'Off',
    value: 'false',
  },
];

export const PRIMARY_FIELDS_OPTIONS: LabelValuePair[] = [
  {
    label: 'INT64',
    value: DataTypeEnum.Int64,
  },
  {
    label: 'VARCHAR',
    value: DataTypeEnum.VarChar,
  },
];
