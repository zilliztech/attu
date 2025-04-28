import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ALL_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';
import { SxProps, Theme, Box, FormHelperText } from '@mui/material';

interface ScalarTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const ScalarTypeSelector: FC<ScalarTypeSelectorProps> = ({
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
        ...sx,
      }}
    >
      <CustomSelector
        options={ALL_OPTIONS}
        size="small"
        onChange={e => {
          onChange(e.target.value as DataTypeEnum);
        }}
        value={value}
        variant="filled"
        label={label || collectionTrans('fieldType')}
        sx={sx}
      />
      <FormHelperText sx={{ marginTop: 0 }}> </FormHelperText>
    </Box>
  );
};

export default ScalarTypeSelector;
