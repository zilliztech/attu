import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ALL_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';
import { SxProps, Theme } from '@mui/material';

interface ScalarTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  className?: string;
  label?: string;
  sx?: SxProps<Theme>;
}

const ScalarTypeSelector: FC<ScalarTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <CustomSelector
      wrapperClass={className}
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
  );
};

export default ScalarTypeSelector;
