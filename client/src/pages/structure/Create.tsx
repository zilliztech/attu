import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import { INDEX_CONFIG, MetricType } from '../../consts/Milvus';
import { useFormValidation } from '../../hooks/Form';
import { formatForm, getMetricOptions } from '../../utils/Form';
import CreateStepTwo from './CreateStepTwo';
import { IndexType, ParamPair } from './Types';

const CreateIndex = (props: {
  collectionName: string;
  dimension: string;
  handleCreate: (params: ParamPair[]) => void;
  handleCancel: () => void;
}) => {
  const { collectionName, dimension, handleCreate, handleCancel } = props;

  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  const [indexSetting, setIndexSetting] = useState<{
    index_type: IndexType;
    metric_type: MetricType;
    [x: string]: string;
  }>({
    index_type: 'IVF_FLAT',
    metric_type: 'L2',
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

  const indexCreateParams = useMemo(() => {
    if (!INDEX_CONFIG[indexSetting.index_type]) {
      return [];
    }
    return INDEX_CONFIG[indexSetting.index_type].create;
  }, [indexSetting.index_type]);

  const metricOptions = useMemo(
    () => getMetricOptions(dimension, indexSetting.index_type),
    [dimension, indexSetting.index_type]
  );

  const checkedForm = useMemo(() => {
    const paramsForm: any = { metric_type: indexSetting.metric_type };
    indexCreateParams.forEach(v => {
      paramsForm[v] = indexSetting[v];
    });
    const form = formatForm(paramsForm);
    return form;
  }, [indexSetting, indexCreateParams]);

  const { validation, checkIsValid, disabled, setDisabled, resetValidation } =
    useFormValidation(checkedForm);

  useEffect(() => {
    setDisabled(true);
    setIndexSetting(v => ({
      ...v,
      metric_type: 'L2',
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
  }, [indexCreateParams, setDisabled]);

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

    const form = formatForm(paramsForm);
    resetValidation(form);
  };

  const handleCreateIndex = () => {
    const { index_type, metric_type } = indexSetting;

    const params: ParamPair[] = [
      {
        key: 'index_type',
        value: index_type,
      },
      {
        key: 'metric_type',
        value: metric_type,
      },
      ...indexCreateParams.map(p => ({
        key: p,
        value: indexSetting[p],
      })),
    ];

    handleCreate(params);
  };

  return (
    <DialogTemplate
      title={dialogTrans('createTitle', {
        type: indexTrans('index'),
        name: collectionName,
      })}
      handleCancel={handleCancel}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateIndex}
      confirmDisabled={disabled}
    >
      <CreateStepTwo
        updateForm={updateStepTwoForm}
        metricOptions={metricOptions}
        formValue={indexSetting}
        checkIsValid={checkIsValid}
        validation={validation}
        indexParams={indexCreateParams}
        indexTypeChange={onIndexTypeChange}
      ></CreateStepTwo>
    </DialogTemplate>
  );
};

export default CreateIndex;
