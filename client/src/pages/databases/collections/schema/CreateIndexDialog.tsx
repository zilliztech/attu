import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { Option } from '@/components/customSelector/Types';
import {
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
  formatFieldType,
} from '@/utils';
import CreateForm from './CreateForm';
import type { IndexType, IndexExtraParam } from './Types';
import type { FieldObject } from '@server/types';
import { INDEX_PARAMS_CONFIG } from './indexParamsConfig';

/**
 * CreateIndex component for creating new indexes
 * Handles index type selection, parameter configuration, and validation
 */
const CreateIndex = (props: {
  collectionName: string;
  field: FieldObject;
  handleCreate: (params: IndexExtraParam, index_name: string) => void;
  handleCancel: () => void;
}) => {
  const { handleCreate, handleCancel, field } = props;

  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  /**
   * Convert field data type to DataTypeEnum
   * Used to determine which index types and parameters are available
   */
  const getFieldType = (): DataTypeEnum => {
    switch (field.data_type) {
      case DataTypeStringEnum.BinaryVector:
        return DataTypeEnum.BinaryVector;
      case DataTypeStringEnum.FloatVector:
      case DataTypeStringEnum.Float16Vector:
      case DataTypeStringEnum.BFloat16Vector:
        return DataTypeEnum.FloatVector;
      case DataTypeStringEnum.SparseFloatVector:
        return DataTypeEnum.SparseFloatVector;
      default:
        return DataTypeEnum.FloatVector;
    }
  };

  const defaultIndexType = INDEX_TYPES_ENUM.AUTOINDEX;

  /**
   * Get default metric type based on field data type
   * Different vector types have different default metric types
   */
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

  // Form state for index creation
  const [indexSetting, setIndexSetting] = useState<{
    index_type: IndexType;
    [x: string]: string;
  }>({
    index_name: '',
    index_type: defaultIndexType,
    metric_type: defaultMetricType,
  });

  /**
   * Get required and optional parameters for the selected index type
   * Parameters are defined in INDEX_PARAMS_CONFIG
   */
  const indexCreateParams = useMemo(() => {
    const fieldType = getFieldType();
    const config = INDEX_PARAMS_CONFIG[fieldType]?.[indexSetting.index_type];
    if (!config) return [];
    return [...config.required, ...config.optional];
  }, [indexSetting.index_type]);

  /**
   * Get available metric types for the selected index type
   * Different index types support different metric types
   */
  const metricOptions = useMemo(() => {
    return isVectorType(field)
      ? getMetricOptions(indexSetting.index_type, field)
      : [];
  }, [indexSetting.index_type, field]);

  /**
   * Prepare parameters for index creation
   * Combines index type, metric type, and other parameters
   */
  const extraParams = useMemo(() => {
    const params: { [x: string]: string } = {};
    indexCreateParams.forEach(v => {
      params[v] = indexSetting[v];
    });

    const { index_type, metric_type } = indexSetting;

    return {
      index_type,
      metric_type,
      params: JSON.stringify(params),
    };
  }, [indexCreateParams, indexSetting]);

  /**
   * Helper function to format index options for the selector
   * Groups options by category (in-memory, disk, GPU)
   */
  const getOptions = (label: string, children: Option[]) => ({
    label,
    children: children.map(child => ({
      ...child,
      key: `${label}-${child.value}`,
    })),
  });

  /**
   * Get available index types based on field type
   * Different field types have different available index types
   */
  const indexOptions = useMemo(() => {
    const autoOption = getOptions('AUTOINDEX', INDEX_OPTIONS_MAP['AUTOINDEX']);
    let options = [];

    if (isVectorType(field)) {
      switch (field.data_type) {
        case DataTypeStringEnum.BinaryVector:
          options = [
            getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.BinaryVector]
            ),
          ];
          break;

        case DataTypeStringEnum.SparseFloatVector:
          options = [
            getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.SparseFloatVector]
            ),
          ];
          break;

        default:
          options = [
            getOptions(
              indexTrans('inMemory'),
              INDEX_OPTIONS_MAP[DataTypeEnum.FloatVector].filter(
                option =>
                  option.value !== INDEX_TYPES_ENUM.DISKANN &&
                  option.value !== INDEX_TYPES_ENUM.GPU_CAGRA &&
                  option.value !== INDEX_TYPES_ENUM.GPU_IVF_FLAT &&
                  option.value !== INDEX_TYPES_ENUM.GPU_IVF_PQ
              )
            ),
            getOptions(
              indexTrans('disk'),
              INDEX_OPTIONS_MAP[DataTypeEnum.FloatVector].filter(
                option => option.value === INDEX_TYPES_ENUM.DISKANN
              )
            ),
            getOptions(
              indexTrans('gpu'),
              INDEX_OPTIONS_MAP[DataTypeEnum.FloatVector].filter(
                option =>
                  option.value === INDEX_TYPES_ENUM.GPU_CAGRA ||
                  option.value === INDEX_TYPES_ENUM.GPU_IVF_FLAT ||
                  option.value === INDEX_TYPES_ENUM.GPU_IVF_PQ
              )
            ),
          ];
          break;
      }
    } else {
      options = [getOptions(indexTrans('scalar'), getScalarIndexOption(field))];
    }

    return [autoOption, ...options];
  }, [field, indexTrans]);

  /**
   * Format form data for validation
   * Combines metric type and index parameters
   */
  const checkedForm = useMemo(() => {
    if (!isVectorType(field)) {
      return [];
    }
    const paramsForm: any = { metric_type: indexSetting.metric_type };
    indexCreateParams.forEach(v => {
      paramsForm[v] = indexSetting[v];
    });
    return formatForm(paramsForm);
  }, [indexSetting, indexCreateParams, field]);

  const { validation, checkIsValid, resetValidation } =
    useFormValidation(checkedForm);

  /**
   * Check if form is valid
   * Validates required parameters and their values
   */
  const isFormValid = useMemo(() => {
    const fieldType = getFieldType();
    const config = INDEX_PARAMS_CONFIG[fieldType]?.[indexSetting.index_type];
    if (!config) return true;

    const hasAllRequiredParams = config.required.every(param => {
      const value = indexSetting[param];
      return value !== undefined && value !== '';
    });

    const validationErrors = Object.entries(validation || {}).filter(
      ([key, error]) => {
        if (!config.required.includes(key) && !indexSetting[key]) {
          return false;
        }
        return (
          error &&
          typeof error === 'object' &&
          'errText' in error &&
          error.errText
        );
      }
    );

    return hasAllRequiredParams && validationErrors.length === 0;
  }, [indexSetting, validation]);

  /**
   * Update form field value
   */
  const updateStepTwoForm = (type: string, value: string) => {
    setIndexSetting(v => ({ ...v, [type]: value }));
  };

  /**
   * Handle index type change
   * Reset parameters when index type changes and set default values from config
   */
  const onIndexTypeChange = (type: string) => {
    const fieldType = getFieldType();
    const config = INDEX_PARAMS_CONFIG[fieldType]?.[type];
    if (!config) return;

    // Create new form state with default values
    const newIndexSetting: {
      index_type: IndexType;
      [key: string]: string;
    } = {
      ...indexSetting,
      index_type: type as IndexType,
    };

    // Set default values for all parameters from config
    Object.entries(config.params).forEach(([key, paramConfig]) => {
      if (paramConfig.defaultValue !== undefined) {
        newIndexSetting[key] = paramConfig.defaultValue.toString();
      } else {
        newIndexSetting[key] = '';
      }
    });

    // Update form state
    setIndexSetting(newIndexSetting);

    // Reset validation with new values
    const paramsForm: { [key: string]: string } = {};
    [...config.required, ...config.optional].forEach(param => {
      paramsForm[param] = newIndexSetting[param];
    });

    resetValidation(formatForm(paramsForm));
  };

  /**
   * Handle index creation
   */
  const handleCreateIndex = async () => {
    await handleCreate(extraParams, indexSetting.index_name);
  };

  return (
    <DialogTemplate
      title={dialogTrans('createTitle', {
        type: indexTrans('index'),
        name: `${field.name} - ${formatFieldType(field)}`,
      })}
      handleClose={handleCancel}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateIndex}
      confirmDisabled={!isFormValid}
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
        wrapperClass="index-form"
        fieldType={getFieldType()}
      />
    </DialogTemplate>
  );
};

export default CreateIndex;
