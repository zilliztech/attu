import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Theme,
  IconButton,
  TextField,
  SelectChangeEvent,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomSelector from '../customSelector/CustomSelector';
import { LOGICAL_OPERATORS, DataTypeStringEnum } from '@/consts';
import { formatValue, checkValue } from './utils';
import type { FC } from 'react';
import type { ConditionProps } from './Types';
import type { FieldObject } from '@server/types';

const Condition: FC<ConditionProps> = props => {
  const {
    onDelete,
    triggerChange,
    fields = [],
    id = '',
    initData,
    className = '',
    ...others
  } = props;
  const [operator, setOperator] = useState(
    initData?.op || LOGICAL_OPERATORS[0].value
  );
  const [conditionField, setConditionField] = useState<FieldObject>(
    initData?.field || fields[0] || {}
  );
  const [jsonKeyValue, setJsonKeyValue] = useState(initData?.jsonKey || '');
  const [conditionValue, setConditionValue] = useState(
    initData?.originValue || ''
  );
  const [isValueLegal, setIsValueLegal] = useState(
    initData?.isCorrect || false
  );

  /**
   * Check condition's value by field's and operator's type.
   * Trigger condition change event.
   */
  useEffect(() => {
    const type = conditionField?.data_type;
    const conditionValueWithNoSpace = conditionValue.replaceAll(' ', '');
    let isLegal = checkValue({
      value: conditionValueWithNoSpace,
      type,
      operator,
    });
    const isKeyLegal =
      type === DataTypeStringEnum.JSON ? jsonKeyValue.trim() !== '' : true;
    setIsValueLegal(isLegal);
    triggerChange(id, {
      field: conditionField,
      op: operator,
      jsonKey: jsonKeyValue,
      value: formatValue(conditionValue, type, operator),
      originValue: conditionValue,
      isCorrect:
        isLegal &&
        ((type === DataTypeStringEnum.JSON && isKeyLegal) ||
          type !== DataTypeStringEnum.JSON),
      id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionField, operator, conditionValue, jsonKeyValue]);

  const logicalOperators = useMemo(() => {
    if (conditionField.data_type === DataTypeStringEnum.Bool) {
      const data = LOGICAL_OPERATORS.filter(v => v.value === '==');
      setOperator(data[0].value);
      return data;
    }
    return LOGICAL_OPERATORS;
  }, [conditionField]);

  const handleOpChange = useCallback((event: SelectChangeEvent<unknown>) => {
    setOperator(event.target.value);
  }, []);

  const handleFieldNameChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const value = event.target.value;
      const target = fields.find(field => field.name === value);
      if (target) setConditionField(target);
    },
    [fields]
  );

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setConditionValue(event.target.value);
    },
    []
  );

  const handleJSONKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setJsonKeyValue(event.target.value);
    },
    []
  );

  const isKeyLegal =
    conditionField?.data_type === DataTypeStringEnum.JSON
      ? jsonKeyValue.trim() !== ''
      : true;

  return (
    <Box
      sx={(theme: Theme) => ({
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        p: theme.spacing(1, 2),
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 2,
        alignItems: 'center',
      })}
      className={className}
      {...others}
    >
      <Box>
        <CustomSelector
          label={conditionField.data_type}
          value={conditionField?.name}
          onChange={handleFieldNameChange}
          options={fields.map(i => ({ value: i.name, label: i.name }))}
          variant="filled"
          sx={{ minWidth: '130px', m: 0 }}
        />
      </Box>
      {conditionField?.data_type === DataTypeStringEnum.JSON && (
        <TextField
          sx={{ width: '150px', m: 0 }}
          label="key"
          variant="filled"
          value={jsonKeyValue}
          onChange={handleJSONKeyChange}
          error={!isKeyLegal}
        />
      )}
      <Box sx={{ margin: '0 8px' }}>
        <CustomSelector
          label="Logic"
          value={operator}
          onChange={handleOpChange}
          options={logicalOperators}
          variant="filled"
          sx={{ minWidth: '100px', m: 0 }}
        />
      </Box>
      <TextField
        sx={{ minWidth: '130px' }}
        label="Value"
        variant="filled"
        value={conditionValue}
        onChange={handleValueChange}
        error={!isValueLegal}
      />
      <IconButton aria-label="close" onClick={onDelete} size="small">
        <CloseIcon sx={{ fontSize: '14px' }} />
      </IconButton>
    </Box>
  );
};

Condition.displayName = 'Condition';

export default Condition;
