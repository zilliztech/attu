import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ALL_OPTIONS } from './Constants';
import { DataTypeEnum } from '@/consts';

interface ElementTypeSelectorProps {
  value: number;
  onChange: (value: DataTypeEnum) => void;
  className?: string;
  label?: string;
}

const ElementTypeSelector: FC<ElementTypeSelectorProps> = ({
  value,
  onChange,
  className = '',
  label,
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
    <CustomSelector
      wrapperClass={className}
      options={elementOptions}
      size="small"
      onChange={(e) => {
        onChange(e.target.value as DataTypeEnum);
      }}
      value={value}
      variant="filled"
      label={label || collectionTrans('elementType')}
    />
  );
};

export default ElementTypeSelector;