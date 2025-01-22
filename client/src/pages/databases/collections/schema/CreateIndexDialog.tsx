import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { Option } from '@/components/customSelector/Types';
import {
  INDEX_CONFIG,
  INDEX_OPTIONS_MAP,
  METRIC_TYPES_VALUES,
  INDEX_TYPES_ENUM,
  DataTypeEnum,
  DataTypeStringEnum,
} from '@/consts';
import { useFormValidation } from '@/hooks';
import {
  formatForm,
  getMetricOptions,
  getScalarIndexOption,
  isVectorType,
} from '@/utils';
import CreateForm from './CreateForm';
import type { IndexType, IndexExtraParam } from './Types';
import type { FieldObject } from '@server/types';

const CreateIndex = (props: {
  collectionName: string;
  field: FieldObject;
  handleCreate: (params: IndexExtraParam, index_name: string) => void;
  handleCancel: () => void;
}) => {
  const { collectionName, handleCreate, handleCancel, field } = props;

  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

  // https://milvus.io/docs/index.md#In-memory-Index
  const defaultIndexType = INDEX_TYPES_ENUM.AUTOINDEX;

  const defaultMetricType = useMemo(() => {
    switch (field.data_type) {
      case DataTypeStringEnum.BinaryVector:
        return METRIC_TYPES_VALUES.HAMMING;
      case DataTypeStringEnum.FloatVector:
      case DataTypeStringEnum.Float16Vector:
      case DataTypeStringEnum.BFloat16Vector:
        return METRIC_TYPES_VALUES.COSINE;
      case DataTypeStringEnum.SparseFloatVector:
        return field.is_function_output
          ? METRIC_TYPES_VALUES.BM25
          : METRIC_TYPES_VALUES.IP;
      default:
        return '';
    }
  }, [field.data_type]);

  const [indexSetting, setIndexSetting] = useState<{
    index_type: IndexType;
    [x: string]: string;
  }>({
    index_name: '',
    index_type: defaultIndexType,
    metric_type: defaultMetricType,
    M: '',
    m: '4',
    efConstruction: '',
    nlist: '',
    nbits: '8',
    n_trees: '',
    outDegree: '',
    candidatePoolSize: '',
    searchLength: '',
    knng: '',
    drop_ratio_build: '0.32',
    with_raw_data: 'true',
    intermediate_graph_degree: '128',
    graph_degree: '64',
    build_algo: 'IVF_PQ',
    cache_dataset_on_device: 'false',
  });

  const indexCreateParams = useMemo(() => {
    if (!INDEX_CONFIG[indexSetting.index_type]) {
      return [];
    }
    return INDEX_CONFIG[indexSetting.index_type].create;
  }, [indexSetting.index_type]);

  const metricOptions = useMemo(() => {
    return isVectorType(field)
      ? getMetricOptions(indexSetting.index_type, field)
      : [];
  }, [indexSetting.index_type, field]);

  const extraParams = useMemo(() => {
    const params: { [x: string]: string } = {};
    indexCreateParams.forEach(v => {
      params[v] = indexSetting[v];
    });

    const { index_type, metric_type } = indexSetting;

    const extraParams: IndexExtraParam = {
      index_type,
      metric_type,
      params: JSON.stringify(params),
    };

    return extraParams;
  }, [indexCreateParams, indexSetting]);

  const getOptions = (label: string, children: Option[]) => [
    { label, children },
  ];

  const indexOptions = useMemo(() => {
    const autoOption = getOptions('AUTOINDEX', INDEX_OPTIONS_MAP['AUTOINDEX']);
    let options = [];

    if (isVectorType(field)) {
      switch (field.data_type) {
        case DataTypeStringEnum.BinaryVector:
          options = [
            ...getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.BinaryVector]
            ),
          ];
          break;

        case DataTypeStringEnum.SparseFloatVector:
          options = [
            ...getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.SparseFloatVector]
            ),
          ];
          break;

        default:
          options = [
            ...getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.FloatVector]
            ),
            ...getOptions(indexTrans('disk'), INDEX_OPTIONS_MAP['DISK']),
            ...getOptions(indexTrans('gpu'), INDEX_OPTIONS_MAP['GPU']),
          ];
          break;
      }
    } else {
      options = [
        ...getOptions(indexTrans('scalar'), getScalarIndexOption(field)),
      ];
    }

    return [...autoOption, ...options];
  }, [field]);

  const checkedForm = useMemo(() => {
    if (!isVectorType(field)) {
      return [];
    }
    const paramsForm: any = { metric_type: indexSetting.metric_type };
    indexCreateParams.forEach(v => {
      paramsForm[v] = indexSetting[v];
    });
    const form = formatForm(paramsForm);
    return form;
  }, [indexSetting, indexCreateParams, field]);

  const {
    validation,
    checkIsValid,
    disabled,
    resetValidation,
    checkFormValid,
  } = useFormValidation(checkedForm);

  const updateStepTwoForm = (type: string, value: string) => {
    setIndexSetting(v => ({ ...v, [type]: value }));
  };

  const onIndexTypeChange = (type: string) => {
    // reset index params
    let paramsForm: { [key in string]: string } = {};
    // m is selector not input
    ((INDEX_CONFIG[type] && INDEX_CONFIG[type].create) || [])
      .filter(t => t !== 'm')
      .forEach(item => {
        paramsForm[item] = '';
      });
    // if no other params, the form should be valid.
    const form = formatForm(paramsForm);
    resetValidation(form);
    // trigger validation check after the render
    setTimeout(() => {
      checkFormValid('.index-form .MuiInputBase-input');
    }, 0);
  };

  const handleCreateIndex = async () => {
    await handleCreate(extraParams, indexSetting.index_name);
  };

  return (
    <DialogTemplate
      title={dialogTrans('createTitle', {
        type: indexTrans('index'),
        name: field.name,
      })}
      handleClose={handleCancel}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateIndex}
      confirmDisabled={disabled}
    >
      <>
        <CreateForm
          updateForm={updateStepTwoForm}
          metricOptions={metricOptions}
          indexOptions={indexOptions}
          formValue={indexSetting}
          checkIsValid={checkIsValid}
          validation={validation}
          indexParams={indexCreateParams}
          indexTypeChange={onIndexTypeChange}
          wrapperClass="index-form"
        />
      </>
    </DialogTemplate>
  );
};

export default CreateIndex;
