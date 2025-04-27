import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCheckResult } from '@/utils';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../databases/collections/Types';

interface DimensionFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
  className?: string;
  inputClassName?: string;
}

const DimensionField: FC<DimensionFieldProps> = ({
  field,
  onChange,
  className = '',
  inputClassName = '',
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  // Return null for sparse vectors as they don't support dimension
  if (field.data_type === DataTypeEnum.SparseFloatVector) {
    return null;
  }

  const validateDimension = (value: string) => {
    const isPositive = getCheckResult({
      value,
      rule: 'positiveNumber',
    });
    const isMultiple = getCheckResult({
      value,
      rule: 'multiple',
      extraParam: {
        multipleNumber: 8,
      },
    });
    if (field.data_type === DataTypeEnum.BinaryVector) {
      return {
        isMultiple,
        isPositive,
      };
    }
    return {
      isPositive,
    };
  };

  const handleChange = (value: string) => {
    onChange(field.id!, { dim: value });
  };

  const getValidationMessage = (value: string) => {
    const { isPositive, isMultiple } = validateDimension(value);

    if (isMultiple === false) {
      return collectionTrans('dimensionMultipleWarning');
    }

    return isPositive ? ' ' : collectionTrans('dimensionPositiveWarning');
  };

  return (
    <TextField
      label={collectionTrans('dimension')}
      defaultValue={field.dim}
      onChange={e => handleChange(e.target.value)}
      variant="filled"
      className={className}
      InputProps={{
        classes: {
          input: inputClassName,
        },
      }}
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      type="number"
      error={getValidationMessage(field.dim as string) !== ' '}
      helperText={getValidationMessage(field.dim as string)}
      FormHelperTextProps={{
        style: {
          lineHeight: '20px',
          fontSize: '10px',
          margin: 0,
          marginLeft: '11px',
        },
      }}
    />
  );
};

export default DimensionField;
