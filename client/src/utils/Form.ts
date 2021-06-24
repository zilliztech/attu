import { Option } from '../components/customSelector/Types';
import { METRIC_TYPES_VALUES } from '../consts/Milvus';
import { IForm } from '../hooks/Form';
import { DataType } from '../pages/collections/Types';
import { IndexType } from '../pages/structure/Types';

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
  fieldType: DataType
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
  ];

  const baseBinaryOptions = [
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

  const type = fieldType === 'FloatVector' ? 'ALL' : indexType;

  const baseOptionsMap: { [key: string]: any } = {
    BinaryVector: {
      FLAT: [
        ...baseBinaryOptions,
        {
          value: METRIC_TYPES_VALUES.SUBSTRUCTURE,
          label: 'Substructure',
        },
        {
          value: METRIC_TYPES_VALUES.SUPERSTRUCTURE,
          label: 'Superstructure',
        },
      ],
      IVF_FLAT: baseBinaryOptions,
    },
    FloatVector: {
      ALL: baseFloatOptions,
    },
  };

  return baseOptionsMap[fieldType][type];
};
