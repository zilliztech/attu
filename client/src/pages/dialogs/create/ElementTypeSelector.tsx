import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormHelperText, SxProps, Theme } from '@mui/material';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ALL_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';

interface ElementTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const ElementTypeSelector: FC<ElementTypeSelectorProps> = ({
  value,
  onChange,
  label,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const elementOptions = ALL_OPTIONS.filter(
    d =>
      d.label !== 'Array' &&
      d.label !== 'JSON' &&
      d.label !== 'VarChar(BM25)' &&
      !d.label.includes('Vector')
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 120,
        position: 'relative',
        top: '-4px',
        ...sx,
      }}
    >
      <CustomSelector
        options={elementOptions}
        size="small"
        onChange={e => {
          onChange(e.target.value as DataTypeEnum);
        }}
        value={value}
        variant="filled"
        label={label || collectionTrans('elementType')}
        sx={{ width: '100%' }}
      />
      <FormHelperText sx={{ marginTop: 0 }}> </FormHelperText>
    </Box>
  );
};

export default ElementTypeSelector;
