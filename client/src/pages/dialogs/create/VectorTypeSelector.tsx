import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { VECTOR_FIELDS_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';
import { SxProps, Theme, Box, FormHelperText } from '@mui/material';

interface VectorTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const VectorTypeSelector: FC<VectorTypeSelectorProps> = ({
  value,
  onChange,
  label,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

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
        options={VECTOR_FIELDS_OPTIONS}
        size="small"
        onChange={e => {
          onChange(e.target.value as DataTypeEnum);
        }}
        value={value}
        variant="filled"
        label={label || `${collectionTrans('vectorType')} `}
        sx={sx}
      />
      <FormHelperText sx={{ marginTop: 0 }}> </FormHelperText>
    </Box>
  );
};

export default VectorTypeSelector;
