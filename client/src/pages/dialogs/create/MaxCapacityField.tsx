import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid, checkRange } from '@/utils';
import { DEFAULT_ATTU_MAX_CAPACITY } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface MaxCapacityFieldProps {
  field: FieldType;
  onChange: (id: string, max_capacity: number, isValid?: boolean) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const MaxCapacityField: FC<MaxCapacityFieldProps> = ({
  field,
  onChange,
  label = 'Max Capacity',
  sx,
}) => {
  const { t: warningTrans } = useTranslation('warning');

  // Initialize max_capacity if not defined
  if (typeof field.max_capacity === 'undefined') {
    onChange(field.id!, DEFAULT_ATTU_MAX_CAPACITY, true);
  }

  // Common validation function to avoid duplicating the validation logic
  const validateField = (value: any) => {
    if (value === null) {
      return { isValid: false, isEmptyValid: false, isRangeValid: false };
    }

    const isEmptyValid = checkEmptyValid(value);
    const isRangeValid = checkRange({
      value,
      min: 1,
      max: 4096,
      type: 'number',
    });

    return {
      isValid: isEmptyValid && isRangeValid,
      isEmptyValid,
      isRangeValid,
    };
  };

  const handleChange = (value: string) => {
    const numValue = Number(value);
    const { isValid } = validateField(numValue);
    onChange(field.id!, numValue, isValid);
  };

  const getError = (value: any) => {
    const { isValid } = validateField(value);
    return !isValid;
  };

  const getHelperText = (value: any) => {
    if (value === null) return ' ';

    const { isEmptyValid, isRangeValid } = validateField(value);

    return !isEmptyValid
      ? warningTrans('requiredOnly')
      : !isRangeValid
        ? warningTrans('range', {
            min: 1,
            max: 4096,
          })
        : ' ';
  };

  return (
    <TextField
      label={label}
      defaultValue={field.max_capacity || DEFAULT_ATTU_MAX_CAPACITY}
      onChange={e => handleChange(e.target.value)}
      variant="filled"
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      type="number"
      error={getError(field.max_capacity)}
      helperText={getHelperText(field.max_capacity)}
      style={{
        width: 100,
      }}
      FormHelperTextProps={{
        style: {
          lineHeight: '20px',
          fontSize: '10px',
          margin: 0,
          marginLeft: '11px',
        },
      }}
      sx={sx}
    />
  );
};

export default MaxCapacityField;
