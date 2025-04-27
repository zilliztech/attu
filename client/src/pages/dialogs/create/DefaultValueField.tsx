import { FC } from 'react';
import { TextField } from '@mui/material';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../databases/collections/Types';

interface DefaultValueFieldProps {
  field: FieldType;
  onChange: (id: string, defaultValue: string) => void;
  className?: string;
  label?: string;
}

const DefaultValueField: FC<DefaultValueFieldProps> = ({
  field,
  onChange,
  className = '',
  label = 'Default Value',
}) => {
  const getInputType = (dataType: DataTypeEnum): 'number' | 'text' => {
    switch (dataType) {
      case DataTypeEnum.Int8:
      case DataTypeEnum.Int16:
      case DataTypeEnum.Int32:
      case DataTypeEnum.Int64:
      case DataTypeEnum.Float:
      case DataTypeEnum.Double:
        return 'number';
      case DataTypeEnum.Bool:
      default:
        return 'text';
    }
  };

  return (
    <TextField
      label={label}
      defaultValue={field.default_value}
      onChange={e => {
        onChange(field.id!, e.target.value);
      }}
      variant="filled"
      InputProps={{
        classes: {
          input: className,
        },
      }}
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      type={getInputType(field.data_type)}
    />
  );
};

export default DefaultValueField;
