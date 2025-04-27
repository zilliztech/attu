import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid, checkRange } from '@/utils';
import { DEFAULT_ATTU_MAX_CAPACITY } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface MaxCapacityFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
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
    onChange(field.id!, { max_capacity: DEFAULT_ATTU_MAX_CAPACITY });
  }

  const handleChange = (value: string) => {
    onChange(field.id!, { max_capacity: value });
  };

  const validateMaxCapacity = (value: any) => {
    if (value === null) return ' ';

    const isEmptyValid = checkEmptyValid(value);
    const isRangeValid = checkRange({
      value,
      min: 1,
      max: 4096,
      type: 'number',
    });

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
      error={validateMaxCapacity(field.max_capacity) !== ' '}
      helperText={validateMaxCapacity(field.max_capacity)}
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
