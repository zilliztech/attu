import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface DescriptionFieldProps {
  field: FieldType;
  onChange: (id: string, description: string) => void;
  sx?: SxProps<Theme>;
}

const DescriptionField: FC<DescriptionFieldProps> = ({
  field,
  onChange,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <TextField
      label={collectionTrans('description')}
      defaultValue={field.description}
      onChange={e => onChange(field.id!, e.target.value)}
      variant="filled"
      size="small"
      InputLabelProps={{
        shrink: true,
      }}
      helperText={' '}
      style={{ width: 80 }}
      sx={{
        ...sx,
      }}
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

export default DescriptionField;
