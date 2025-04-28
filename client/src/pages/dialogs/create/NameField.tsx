import { TextField } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid } from '@/utils';
import { VectorTypes } from '@/consts';
import type { FieldType } from '../../databases/collections/Types';

interface NameFieldProps {
  field: FieldType;
  onChange: (id: string, name: string, isValid: boolean) => void;
  label?: string;
  isReadOnly?: boolean;
}

const NameField: FC<NameFieldProps> = ({
  field,
  onChange,
  label,
  isReadOnly = false,
}) => {
  const { t: collectionTrans } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');
  const [value, setValue] = useState<string>(field.name || '');
  const [touched, setTouched] = useState<boolean>(false);

  // Determine the label based on field type
  const defaultLabel = collectionTrans(
    VectorTypes.includes(field.data_type) ? 'vectorFieldName' : 'fieldName'
  );

  // Validate the field value
  const isNameValid = (name: string): boolean => {
    return checkEmptyValid(name);
  };

  // Get error message based on validation result
  const getErrorMessage = (name: string): string => {
    // Only show error message if the field has been touched
    if (!touched) return ' ';
    return isNameValid(name) ? ' ' : warningTrans('requiredOnly');
  };

  // Current validation state
  const isValid = isNameValid(value);
  const errorMessage = getErrorMessage(value);

  // Sync initial value from props
  useEffect(() => {
    if (field.name !== undefined && field.name !== value) {
      setValue(field.name);
    }
  }, [field.name]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setTouched(true);
    if (field.id) {
      onChange(field.id, newValue, isNameValid(newValue));
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <TextField
      label={label || defaultLabel}
      value={value}
      onChange={e => handleChange(e.target.value)}
      onBlur={handleBlur}
      variant="filled"
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      disabled={isReadOnly}
      error={touched && !isValid}
      helperText={errorMessage}
      style={{ width: 128 }}
      FormHelperTextProps={{
        style: {
          lineHeight: '20px',
          fontSize: '10px',
          margin: 0,
          marginLeft: '11px',
        },
      }}
    />
  );
};

export default NameField;
