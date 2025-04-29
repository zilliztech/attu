import { TextField } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { checkEmptyValid } from '@/utils';
import { VectorTypes } from '@/consts';
import type { FieldType } from '../../databases/collections/Types';

interface NameFieldProps {
  field: FieldType;
  fields: FieldType[];
  onChange: (id: string, name: string, isValid: boolean) => void;
  label?: string;
  isReadOnly?: boolean;
}

const NameField: FC<NameFieldProps> = ({
  field,
  fields,
  onChange,
  label,
  isReadOnly = false,
}) => {
  const { t: collectionTrans } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');
  const [touched, setTouched] = useState<boolean>(false);

  // Determine the label based on field type
  const defaultLabel = collectionTrans(
    VectorTypes.includes(field.data_type) ? 'vectorFieldName' : 'fieldName'
  );

  // Initialize name if not defined
  useEffect(() => {
    if (field.name === undefined && field.id) {
      onChange(field.id, '', false);
    }
  }, []);

  // Common validation function
  const validateField = (name: string) => {
    const isValid = checkEmptyValid(name);
    const isDuplicate =
      fields.filter((f: FieldType) => f.name === name && f.id !== field.id)
        .length > 0;
    return { isValid: isValid && !isDuplicate, isDuplicate };
  };

  const handleChange = (newValue: string) => {
    setTouched(true);
    if (field.id) {
      const { isValid } = validateField(newValue);
      onChange(field.id, newValue, isValid);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getError = (name: string) => {
    if (!touched) return false;
    const { isValid } = validateField(name);
    return !isValid;
  };

  const getHelperText = (name: string) => {
    if (!touched) return ' ';
    const { isValid, isDuplicate } = validateField(name);
    if (isDuplicate) return collectionTrans('fieldNameExist');
    return isValid ? ' ' : warningTrans('requiredOnly');
  };

  return (
    <TextField
      label={label || defaultLabel}
      defaultValue={field.name || ''}
      onChange={e => handleChange(e.target.value)}
      onBlur={handleBlur}
      variant="filled"
      InputLabelProps={{
        shrink: true,
      }}
      size="small"
      disabled={isReadOnly}
      error={getError(field.name || '')}
      helperText={getHelperText(field.name || '')}
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
