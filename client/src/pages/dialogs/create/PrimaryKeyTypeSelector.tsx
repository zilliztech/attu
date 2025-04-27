import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { PRIMARY_FIELDS_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';

interface PrimaryKeyTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  className?: string;
  label?: string;
}

const PrimaryKeyTypeSelector: FC<PrimaryKeyTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <CustomSelector
      wrapperClass={className}
      options={PRIMARY_FIELDS_OPTIONS}
      size="small"
      onChange={(e) => {
        onChange(e.target.value as DataTypeEnum);
      }}
      value={value}
      variant="filled"
      label={label || `${collectionTrans('idType')} `}
    />
  );
};

export default PrimaryKeyTypeSelector;