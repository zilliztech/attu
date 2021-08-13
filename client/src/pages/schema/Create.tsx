import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeLanguageEnum, CodeViewData } from '../../components/code/Types';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomSwitch from '../../components/customSwitch/CustomSwitch';
import {
  INDEX_CONFIG,
  INDEX_OPTIONS_MAP,
  MetricType,
  METRIC_TYPES_VALUES,
} from '../../consts/Milvus';
import { useFormValidation } from '../../hooks/Form';
import { getCreateIndexJSCode } from '../../utils/code/Js';
import { getCreateIndexPYCode } from '../../utils/code/Py';
import { formatForm, getMetricOptions } from '../../utils/Form';
import { getEmbeddingType } from '../../utils/search';
import { DataType } from '../collections/Types';
import CreateForm from './CreateForm';
import { IndexType, ParamPair, INDEX_TYPES_ENUM } from './Types';

const CreateIndex = (props: {
  collectionName: string;
  fieldType: DataType;
  handleCreate: (params: ParamPair[]) => void;
  handleCancel: () => void;

  // used for code mode
  fieldName: string;
}) => {
  const { collectionName, fieldType, handleCreate, handleCancel, fieldName } =
    props;

  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

  const defaultIndexType =
    fieldType === 'BinaryVector'
      ? INDEX_TYPES_ENUM.BIN_IVF_FLAT
      : INDEX_TYPES_ENUM.IVF_FLAT;
  const defaultMetricType =
    fieldType === 'BinaryVector'
      ? METRIC_TYPES_VALUES.HAMMING
      : METRIC_TYPES_VALUES.L2;

  const [indexSetting, setIndexSetting] = useState<{
    index_type: IndexType;
    metric_type: MetricType;
    [x: string]: string;
  }>({
    index_type: defaultIndexType,
    metric_type: defaultMetricType,
    M: '',
    m: '4',
    efConstruction: '',
    nlist: '',
    n_trees: '',
    outDegree: '',
    candidatePoolSize: '',
    searchLength: '',
    knng: '',
  });

  // control whether show code mode
  const [showCode, setShowCode] = useState<boolean>(false);

  const indexCreateParams = useMemo(() => {
    if (!INDEX_CONFIG[indexSetting.index_type]) {
      return [];
    }
    return INDEX_CONFIG[indexSetting.index_type].create;
  }, [indexSetting.index_type]);

  const metricOptions = useMemo(
    () => getMetricOptions(indexSetting.index_type, fieldType),
    [indexSetting.index_type, fieldType]
  );

  const extraParams = useMemo(() => {
    const params: { [x: string]: string } = {};
    indexCreateParams.forEach(v => {
      params[v] = indexSetting[v];
    });

    const { index_type, metric_type } = indexSetting;

    const extraParams: ParamPair[] = [
      {
        key: 'index_type',
        value: index_type,
      },
      {
        key: 'metric_type',
        value: metric_type,
      },
      {
        key: 'params',
        value: JSON.stringify(params),
      },
    ];

    return extraParams;
  }, [indexCreateParams, indexSetting]);

  const indexOptions = useMemo(() => {
    const type = getEmbeddingType(fieldType);
    return INDEX_OPTIONS_MAP[type];
  }, [fieldType]);

  const checkedForm = useMemo(() => {
    const paramsForm: any = { metric_type: indexSetting.metric_type };
    indexCreateParams.forEach(v => {
      paramsForm[v] = indexSetting[v];
    });
    const form = formatForm(paramsForm);
    return form;
  }, [indexSetting, indexCreateParams]);

  /**
   * create index code mode
   */
  const codeBlockData: CodeViewData[] = useMemo(
    () => [
      {
        label: commonTrans('js'),
        language: CodeLanguageEnum.javascript,
        code: getCreateIndexJSCode({ collectionName, fieldName, extraParams }),
      },
      {
        label: commonTrans('py'),
        language: CodeLanguageEnum.python,
        code: getCreateIndexPYCode({ collectionName, fieldName, extraParams }),
      },
    ],
    [commonTrans, extraParams, collectionName, fieldName]
  );

  const { validation, checkIsValid, disabled, setDisabled, resetValidation } =
    useFormValidation(checkedForm);

  // reset index params
  useEffect(() => {
    // no need
    // setDisabled(true);
    setIndexSetting(v => ({
      ...v,
      metric_type: defaultMetricType,
      M: '',
      m: '4',
      efConstruction: '',
      nlist: '',
      n_trees: '',
      out_degree: '',
      candidate_pool_size: '',
      search_length: '',
      knng: '',
    }));
  }, [indexCreateParams, setDisabled, defaultMetricType]);

  const updateStepTwoForm = (type: string, value: string) => {
    setIndexSetting(v => ({ ...v, [type]: value }));
  };

  const onIndexTypeChange = (type: string) => {
    let paramsForm: { [key in string]: string } = {};
    // m is selector not input
    (INDEX_CONFIG[type].create || [])
      .filter(t => t !== 'm')
      .forEach(item => {
        paramsForm[item] = '';
      });
    // if no other params, the form should be valid.
    setDisabled((INDEX_CONFIG[type].create || []).length === 0 ? false : true);
    const form = formatForm(paramsForm);
    resetValidation(form);
  };

  const handleCreateIndex = () => {
    handleCreate(extraParams);
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
      <CreateForm
        updateForm={updateStepTwoForm}
        metricOptions={metricOptions}
        indexOptions={indexOptions}
        formValue={indexSetting}
        checkIsValid={checkIsValid}
        validation={validation}
        indexParams={indexCreateParams}
        indexTypeChange={onIndexTypeChange}
      />
    </DialogTemplate>
  );
};

export default CreateIndex;
