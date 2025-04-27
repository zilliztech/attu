import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ALL_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';

interface ScalarTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  className?: string;
  label?: string;
}

const ScalarTypeSelector: FC<ScalarTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label,
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
    />
  );
};

export default ScalarTypeSelector;
