import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid, checkRange } from '@/utils';
import { DEFAULT_ATTU_VARCHAR_MAX_LENGTH } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface MaxLengthFieldProps {
  field: FieldType;
  onChange: (id: string, max_length: number, isValid?: boolean) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const MaxLengthField: FC<MaxLengthFieldProps> = ({
  field,
  onChange,
  label = 'Max Length',
  sx,
}) => {
  const { t: warningTrans } = useTranslation('warning');

  // Initialize max_length if not defined
  if (typeof field.max_length === 'undefined') {
    onChange(field.id!, DEFAULT_ATTU_VARCHAR_MAX_LENGTH, true);
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
      max: 65535,
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
            max: 65535,
          })
        : ' ';
  };

  return (
    <TextField
      label={label}
      defaultValue={field.max_length || DEFAULT_ATTU_VARCHAR_MAX_LENGTH}
      onChange={e => handleChange(e.target.value)}
      variant="filled"
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      type="number"
      error={getError(field.max_length)}
      helperText={getHelperText(field.max_length)}
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

export default MaxLengthField;
