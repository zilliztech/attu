import { FC } from 'react';
import { TextField } from '@mui/material';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface DefaultValueFieldProps {
  field: FieldType;
  onChange: (id: string, defaultValue: string) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const DefaultValueField: FC<DefaultValueFieldProps> = ({
  field,
  onChange,
  label = 'Default Value',
  sx,
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
      InputLabelProps={{
        shrink: true,
      }}
      helperText={' '}
      size="small"
      type={getInputType(field.data_type)}
      sx={sx}
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

export default DefaultValueField;
