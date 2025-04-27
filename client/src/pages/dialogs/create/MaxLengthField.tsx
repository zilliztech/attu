import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid, checkRange } from '@/utils';
import { DEFAULT_ATTU_VARCHAR_MAX_LENGTH } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface MaxLengthFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
  className?: string;
  inputClassName?: string;
  label?: string;
  sx?: SxProps<Theme>;
}

const MaxLengthField: FC<MaxLengthFieldProps> = ({
  field,
  onChange,
  className = '',
  inputClassName = '',
  label = 'Max Length',
  sx,
}) => {
  const { t: warningTrans } = useTranslation('warning');

  // Initialize max_length if not defined
  if (typeof field.max_length === 'undefined') {
    onChange(field.id!, { max_length: DEFAULT_ATTU_VARCHAR_MAX_LENGTH });
  }

  const handleChange = (value: string) => {
    onChange(field.id!, { max_length: value });
  };

  const validateMaxLength = (value: any) => {
    if (value === null) return ' ';

    const isEmptyValid = checkEmptyValid(value);
    const isRangeValid = checkRange({
      value,
      min: 1,
      max: 65535,
      type: 'number',
    });

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
      error={validateMaxLength(field.max_length) !== ' '}
      helperText={validateMaxLength(field.max_length)}
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
