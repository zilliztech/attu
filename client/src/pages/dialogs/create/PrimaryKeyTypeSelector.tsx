import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { PRIMARY_FIELDS_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';
import { SxProps, Theme, Box, InputLabel, FormHelperText } from '@mui/material';

interface PrimaryKeyTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  label?: string;
  sx?: SxProps<Theme>;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  disabled?: boolean;
  id?: string;
}

const PrimaryKeyTypeSelector: FC<PrimaryKeyTypeSelectorProps> = ({
  value,
  onChange,
  label,
  sx,
  required = false,
  error = false,
  helperText = ' ',
  disabled = false,
  id = 'primary-key-type-selector',
}) => {
  const { t: collectionTrans } = useTranslation('collection');
  const displayLabel = label || `${collectionTrans('idType')}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 140,
        ...sx,
      }}
    >
      <CustomSelector
        id={id}
        labelId={`${id}-label`}
        options={PRIMARY_FIELDS_OPTIONS}
        size="small"
        onChange={e => {
          onChange(e.target.value as DataTypeEnum);
        }}
        disabled={disabled}
        required={required}
        error={error}
        value={value}
        variant="filled"
        label={displayLabel}
      />
      <FormHelperText sx={{ marginTop: 0 }}>{helperText}</FormHelperText>
    </Box>
  );
};

export default PrimaryKeyTypeSelector;
