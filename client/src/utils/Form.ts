import { Option } from '@/components/customSelector/Types';
import { METRIC_TYPES_VALUES, DataTypeStringEnum } from '@/consts';
import { IForm } from '@/hooks';
import { IndexType } from '@/pages/databases/collections/overview/Types';

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
  fieldType: DataTypeStringEnum
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

  const type = fieldType === 'FloatVector' ? 'ALL' : indexType;

  const baseOptionsMap: { [key: string]: any } = {
    BinaryVector: {
      BIN_FLAT: [
        ...baseBinaryOptions,
        {
          value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
          label: 'SUBSTRUCTURE',
        },
        {
          value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
          label: 'SUPERSTRUCTURE',
        },
      ],
      BIN_IVF_FLAT: baseBinaryOptions,
    },
    FloatVector: {
      ALL: baseFloatOptions,
    },
  };

  return baseOptionsMap[fieldType][type];
};
