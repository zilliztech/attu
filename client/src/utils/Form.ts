import { Option } from '@/components/customSelector/Types';
import {
  METRIC_TYPES_VALUES,
  DataTypeEnum,
  SCALAR_INDEX_OPTIONS,
  DataTypeStringEnum,
  INDEX_TYPES_ENUM,
} from '@/consts';
import { IForm } from '@/hooks';
import { IndexType } from '@/pages/databases/collections/schema/Types';

interface IInfo {
  [key: string]: any;
}

export const formatForm = (info: IInfo): IForm[] => {
  const form: IForm[] = Object.entries(info).map(item => {
    const [key, value] = item;
    return {
      key,
      value,
      needCheck: true,
    };
  });
  return form;
};

export const getMetricOptions = (
  indexType: IndexType,
  fieldType: DataTypeEnum
): Option[] => {
  const baseFloatOptions = [
    {
      value: METRIC_TYPES_VALUES.L2,
      label: 'L2',
    },
    {
      value: METRIC_TYPES_VALUES.IP,
      label: 'IP',
    },
    {
      value: METRIC_TYPES_VALUES.COSINE,
      label: 'COSINE',
    },
  ];

  const baseBinaryOptions = [
    {
      value: METRIC_TYPES_VALUES.HAMMING,
      label: 'HAMMING',
    },
    {
      value: METRIC_TYPES_VALUES.JACCARD,
      label: 'JACCARD',
    },
    {
      value: METRIC_TYPES_VALUES.TANIMOTO,
      label: 'TANIMOTO',
    },
  ];

  switch (fieldType) {
    case DataTypeEnum.FloatVector:
    case DataTypeEnum.Float16Vector:
    case DataTypeEnum.BFloat16Vector:
      return baseFloatOptions;
    case DataTypeEnum.SparseFloatVector:
      return [
        {
          value: METRIC_TYPES_VALUES.IP,
          label: 'IP',
        },
        {
          value: METRIC_TYPES_VALUES.BM25,
          label: 'BM25',
        },
      ];
    case DataTypeEnum.BinaryVector:
      switch (indexType) {
        case 'BIN_FLAT':
          return [
            ...baseBinaryOptions,
            {
              value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
              label: 'SUBSTRUCTURE',
            },
            {
              value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
              label: 'SUPERSTRUCTURE',
            },
          ];
        case 'BIN_IVF_FLAT':
          return baseBinaryOptions;
        default:
          return baseBinaryOptions;
      }
    default:
      return [];
  }
};

export const getScalarIndexOption = (
  fieldType: DataTypeStringEnum,
  elementType?: DataTypeStringEnum
): Option[] => {
  // Helper function to check if a type is numeric
  const isNumericType = (type: DataTypeStringEnum): boolean =>
    ['Int8', 'Int16', 'Int32', 'Int64', 'Float', 'Double'].includes(type);

  // Helper function to check if a type is valid for bitmap
  const isBitmapSupportedType = (type: DataTypeStringEnum): boolean =>
    ['Bool', 'Int8', 'Int16', 'Int32', 'Int64', 'VarChar'].includes(type);

  // Initialize the options array
  const options: Option[] = [];

  // Add options based on fieldType
  if (fieldType === DataTypeStringEnum.VarChar) {
    options.push(
      SCALAR_INDEX_OPTIONS.find(
        opt => opt.value === INDEX_TYPES_ENUM.MARISA_TRIE
      )!
    );
  }

  if (isNumericType(fieldType)) {
    options.push(
      SCALAR_INDEX_OPTIONS.find(opt => opt.value === INDEX_TYPES_ENUM.SORT)!
    );
  }

  if (
    fieldType === DataTypeStringEnum.Array &&
    elementType &&
    isBitmapSupportedType(elementType)
  ) {
    options.push(
      SCALAR_INDEX_OPTIONS.find(opt => opt.value === INDEX_TYPES_ENUM.BITMAP)!
    );
  } else if (isBitmapSupportedType(fieldType)) {
    options.push(
      SCALAR_INDEX_OPTIONS.find(opt => opt.value === INDEX_TYPES_ENUM.BITMAP)!
    );
  }

  // INVERTED index is a general-purpose index for all scalar fields
  options.push(
    SCALAR_INDEX_OPTIONS.find(opt => opt.value === INDEX_TYPES_ENUM.INVERTED)!
  );

  return options;
};
