import { useCallback, useState, useEffect, useRef } from 'react';
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

  // Use refs to stabilize function calls
  const onChangeRef = useRef(onChange);
  const onSubmitRef = useRef(onSubmit);
  const onKeyDownRef = useRef(onKeyDown);

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  }, [onKeyDown]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChangeRef.current(newValue);
    },
    [] // Remove dependencies since we use refs
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      onKeyDownRef.current(e);
    },
    [] // Remove dependencies since we use refs
  );

  const handleFilterSubmit = useCallback(
    (expression: string) => {
      setLocalValue(expression);
      onChangeRef.current(expression);
      onSubmitRef.current(expression);
    },
    [] // Remove dependencies since we use refs
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
