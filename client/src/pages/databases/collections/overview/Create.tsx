import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeLanguageEnum, CodeViewData } from '@/components/code/Types';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomSwitch from '@/components/customSwitch/CustomSwitch';
import {
  INDEX_CONFIG,
  INDEX_OPTIONS_MAP,
  METRIC_TYPES_VALUES,
  INDEX_TYPES_ENUM,
  DataTypeEnum,
  DataTypeStringEnum,
  VectorTypes,
} from '@/consts';
import { useFormValidation } from '@/hooks';
import { getCreateIndexJSCode } from '@/utils/code/Js';
import { getCreateIndexPYCode } from '@/utils/code/Py';
import { getCreateIndexJavaCode } from '@/utils/code/Java';
import { formatForm, getMetricOptions } from '@/utils';
import CreateForm from './CreateForm';
import { IndexType, IndexExtraParam } from './Types';

const CreateIndex = (props: {
  collectionName: string;
  fieldType: DataTypeStringEnum;
  dataType: DataTypeEnum;
  handleCreate: (params: IndexExtraParam, index_name: string) => void;
  handleCancel: () => void;

  // used for code mode
  fieldName: string;
  // used for sizing info
  dimension: number;
}) => {
  const {
    collectionName,
    fieldType,
    handleCreate,
    handleCancel,
    fieldName,
    dataType,
  } = props;

  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

  // https://milvus.io/docs/index.md#In-memory-Index
  const defaultIndexType = useMemo(() => {
    switch (fieldType) {
      case DataTypeStringEnum.BinaryVector:
        return INDEX_TYPES_ENUM.BIN_IVF_FLAT;
      case DataTypeStringEnum.FloatVector:
      case DataTypeStringEnum.Float16Vector:
      case DataTypeStringEnum.BFloat16Vector:
        return INDEX_TYPES_ENUM.AUTOINDEX;
      case DataTypeStringEnum.SparseFloatVector:
        return INDEX_TYPES_ENUM.SPARSE_WAND;
      case DataTypeStringEnum.VarChar:
        return INDEX_TYPES_ENUM.MARISA_TRIE;
      case DataTypeStringEnum.Int8:
      case DataTypeStringEnum.Int16:
      case DataTypeStringEnum.Int32:
      case DataTypeStringEnum.Int64:
        return INDEX_TYPES_ENUM.INVERTED;
      default:
        return INDEX_TYPES_ENUM.INVERTED;
    }
  }, [fieldType]);

  const defaultMetricType = useMemo(() => {
    switch (fieldType) {
      case DataTypeStringEnum.BinaryVector:
        return METRIC_TYPES_VALUES.HAMMING;
      case DataTypeStringEnum.FloatVector:
      case DataTypeStringEnum.Float16Vector:
      case DataTypeStringEnum.BFloat16Vector:
        return METRIC_TYPES_VALUES.COSINE;
      case DataTypeStringEnum.SparseFloatVector:
        return METRIC_TYPES_VALUES.IP;
      default:
        return '';
    }
  }, [fieldType]);

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
    drop_ratio_build: '0.5',
    with_raw_data: 'true',
  });

  // control whether show code mode
  const [showCode, setShowCode] = useState<boolean>(false);

  const indexCreateParams = useMemo(() => {
    if (!INDEX_CONFIG[indexSetting.index_type]) {
      return [];
    }
    return INDEX_CONFIG[indexSetting.index_type].create;
  }, [indexSetting.index_type]);

  const metricOptions = useMemo(() => {
    return VectorTypes.includes(dataType)
      ? getMetricOptions(indexSetting.index_type, dataType)
      : [];
  }, [indexSetting.index_type, fieldType]);

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

  const indexOptions = useMemo(() => {
    switch (fieldType) {
      case DataTypeStringEnum.BinaryVector:
        return INDEX_OPTIONS_MAP[DataTypeEnum.BinaryVector];
      case DataTypeStringEnum.FloatVector:
      case DataTypeStringEnum.Float16Vector:
      case DataTypeStringEnum.BFloat16Vector:
        return INDEX_OPTIONS_MAP[DataTypeEnum.FloatVector];
      case DataTypeStringEnum.SparseFloatVector:
        return INDEX_OPTIONS_MAP[DataTypeEnum.SparseFloatVector];
      case DataTypeStringEnum.VarChar:
        return INDEX_OPTIONS_MAP[DataTypeEnum.VarChar];

      default:
        return [
          { label: 'INVERTED', value: INDEX_TYPES_ENUM.INVERTED },
          { label: 'STL sort', value: INDEX_TYPES_ENUM.SORT },
        ];
    }
  }, [fieldType]);

  const checkedForm = useMemo(() => {
    if (!VectorTypes.includes(dataType)) {
      return [];
    }
    const paramsForm: any = { metric_type: indexSetting.metric_type };
    indexCreateParams.forEach(v => {
      paramsForm[v] = indexSetting[v];
    });
    const form = formatForm(paramsForm);
    return form;
  }, [indexSetting, indexCreateParams, fieldType]);

  /**
   * create index code mode
   */
  const codeBlockData: CodeViewData[] = useMemo(() => {
    const isScalarField = !VectorTypes.includes(dataType);
    const getCodeParams = {
      collectionName,
      fieldName,
      extraParams,
      isScalarField,
      indexName: indexSetting.index_name,
      metricType: indexSetting.metric_type,
      indexType: indexSetting.index_type,
    };
    return [
      {
        label: commonTrans('py'),
        language: CodeLanguageEnum.python,
        code: getCreateIndexPYCode(getCodeParams),
      },
      {
        label: commonTrans('java'),
        language: CodeLanguageEnum.java,
        code: getCreateIndexJavaCode(getCodeParams),
      },
      {
        label: commonTrans('js'),
        language: CodeLanguageEnum.javascript,
        code: getCreateIndexJSCode(getCodeParams),
      },
    ];
  }, [
    commonTrans,
    extraParams,
    collectionName,
    fieldName,
    indexSetting.index_name,
    fieldType,
  ]);

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
    (INDEX_CONFIG[type].create || [])
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

  const handleCreateIndex = () => {
    handleCreate(extraParams, indexSetting.index_name);
  };

  const handleShowCode = (event: React.ChangeEvent<{ checked: boolean }>) => {
    const isChecked = event.target.checked;
    setShowCode(isChecked);
  };

  return (
    <DialogTemplate
      title={dialogTrans('createTitle', {
        type: indexTrans('index'),
        name: collectionName,
      })}
      handleClose={handleCancel}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateIndex}
      confirmDisabled={disabled}
      leftActions={<CustomSwitch onChange={handleShowCode} />}
      showCode={showCode}
      codeBlocksData={codeBlockData}
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
