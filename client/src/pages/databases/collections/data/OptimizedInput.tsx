import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/customInput/CustomInput';
import Filter from '@/components/advancedSearch';
import type { FieldObject } from '@server/types';

interface OptimizedInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: any) => void;
  disabled?: boolean;
  fields: FieldObject[];
  onSubmit: (expression: string) => void;
}

const OptimizedInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  fields,
  onSubmit,
}: OptimizedInputProps) => {
  const { t: collectionTrans } = useTranslation('collection');
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      onKeyDown(e);
    },
    [onKeyDown]
  );

  const handleFilterSubmit = useCallback(
    (expression: string) => {
      setLocalValue(expression);
      onChange(expression);
      onSubmit(expression);
    },
    [onChange, onSubmit]
  );

  return (
    <CustomInput
      type="text"
      textConfig={{
        label: localValue
          ? collectionTrans('queryExpression')
          : collectionTrans('exprPlaceHolder'),
        key: 'advFilter',
        className: 'textarea',
        onChange: handleChange,
        value: localValue,
        disabled,
        variant: 'filled',
        required: false,
        InputLabelProps: { shrink: true },
        InputProps: {
          endAdornment: (
            <Filter
              title={''}
              showTitle={false}
              fields={fields}
              filterDisabled={disabled}
              onSubmit={handleFilterSubmit}
              showTooltip={false}
            />
          ),
        },
        onKeyDown: handleKeyDown,
      }}
      checkValid={() => true}
    />
  );
};

export default OptimizedInput;
