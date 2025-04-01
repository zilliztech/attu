import React from 'react';
import { TextField } from '@mui/material';
import { DataTypeEnum } from '@/consts';
import type { FieldType } from '../../databases/collections/Types';

interface DefaultValueInputProps {
  field: FieldType;
  onChange: (id: string, value: string) => void;
  label: string;
}

const DefaultValueInput: React.FC<DefaultValueInputProps> = ({
  field,
  onChange,
  label,
}) => {
  const getInputType = () => {
    switch (field.data_type) {
      case DataTypeEnum.Int8:
      case DataTypeEnum.Int16:
      case DataTypeEnum.Int32:
      case DataTypeEnum.Int64:
      case DataTypeEnum.Float:
      case DataTypeEnum.Double:
        return 'number';
      default:
        return 'text';
    }
  };

  return (
    <TextField
      label={label}
      value={field.default_value || ''}
      type={getInputType()}
      onChange={e => onChange(field.id!, e.target.value)}
      variant="outlined"
      size="small"
      fullWidth
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
};

export default DefaultValueInput;
