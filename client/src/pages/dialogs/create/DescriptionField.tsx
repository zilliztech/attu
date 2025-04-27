import { FC } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface DescriptionFieldProps {
  field: FieldType;
  onChange: (id: string, description: string) => void;
  className?: string;
  sx?: SxProps<Theme>;
}

const DescriptionField: FC<DescriptionFieldProps> = ({
  field,
  onChange,
  className,
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
      InputProps={{
        classes: {
          input: className,
        },
      }}
      InputLabelProps={{
        shrink: true,
      }}
      sx={{
        width: '128',
        ...sx,
      }}
    />
  );
};

export default DescriptionField;
