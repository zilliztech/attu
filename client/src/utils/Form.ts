import { Option } from '../components/customSelector/Types';
import { METRIC_TYPES, METRIC_TYPES_VALUES } from '../consts/Milvus';
import { IForm } from '../hooks/Form';
import { IndexType } from '../pages/structure/Types';
import { checkMultiple } from './Validation';

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
  dimension: string,
  indexType: IndexType
): Option[] => {
  const baseOptions = [
    {
      value: METRIC_TYPES_VALUES.L2,
      label: 'L2',
    },
    {
      value: METRIC_TYPES_VALUES.IP,
      label: 'IP',
    },
  ];
  if (!checkMultiple({ value: dimension, multipleNumber: 8 })) {
    return baseOptions;
  }

  switch (indexType) {
    case 'FLAT':
      return METRIC_TYPES;

    case 'IVF_FLAT':
      return [
        ...baseOptions,
        {
          value: METRIC_TYPES_VALUES.HAMMING,
          label: 'Hamming',
        },
        {
          value: METRIC_TYPES_VALUES.JACCARD,
          label: 'Jaccard',
        },
        {
          value: METRIC_TYPES_VALUES.TANIMOTO,
          label: 'Tanimoto',
        },
      ];

    default:
      return baseOptions;
  }
};
