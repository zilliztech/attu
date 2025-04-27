import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { VECTOR_FIELDS_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';

interface VectorTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  className?: string;
  label?: string;
}

const VectorTypeSelector: FC<VectorTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <CustomSelector
      wrapperClass={className}
      options={VECTOR_FIELDS_OPTIONS}
      size="small"
      onChange={(e) => {
        onChange(e.target.value as DataTypeEnum);
      }}
      value={value}
      variant="filled"
      label={label || `${collectionTrans('vectorType')} `}
    />
  );
};

export default VectorTypeSelector;