import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { PRIMARY_FIELDS_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';
import { SxProps, Theme } from '@mui/material';

interface PrimaryKeyTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

const PrimaryKeyTypeSelector: FC<PrimaryKeyTypeSelectorProps> = ({
  value,
  onChange,
  label,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <CustomSelector
      options={PRIMARY_FIELDS_OPTIONS}
      size="small"
      onChange={e => {
        onChange(e.target.value as DataTypeEnum);
      }}
      value={value}
      variant="filled"
      label={label || `${collectionTrans('idType')} `}
      sx={sx}
    />
  );
};

export default PrimaryKeyTypeSelector;
