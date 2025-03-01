import React, { useState, useEffect, useMemo } from 'react';
import { Theme, IconButton, TextField, SelectChangeEvent } from '@mui/material';
import { makeStyles } from '@mui/styles';
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

  const [isKeyLegal, setIsKeyLegal] = useState(initData?.isCorrect || false);

  /**
   * Check condition's value by field's and operator's type.
   * Trigger condition change event.
   */
  useEffect(() => {
    const type = conditionField?.data_type;
    const conditionValueWithNoSpace = conditionValue.replaceAll(' ', '');
    let isKeyLegal = false;
    let isLegal = checkValue({
      value: conditionValueWithNoSpace,
      type,
      operator,
    });

    // if type is json, check the json key is valid
    if (type === DataTypeStringEnum.JSON) {
      isKeyLegal = jsonKeyValue.trim() !== '';
    }

    setIsKeyLegal(isKeyLegal);
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
    // No need for 'id' and 'triggerChange'.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionField, operator, conditionValue, jsonKeyValue]);

  const classes = useStyles();

  const logicalOperators = useMemo(() => {
    if (conditionField.data_type === DataTypeStringEnum.Bool) {
      const data = LOGICAL_OPERATORS.filter(v => v.value === '==');
      setOperator(data[0].value);
      // bool only support ==
      return data;
    }
    return LOGICAL_OPERATORS;
  }, [conditionField]);

  // Logic operator input change.
  const handleOpChange = (event: SelectChangeEvent<unknown>) => {
    setOperator(event.target.value);
  };
  // Field Name input change.
  const handleFieldNameChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    const target = fields.find(field => field.name === value);
    target && setConditionField(target);
  };
  // Value input change.
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConditionValue(value);
  };

  // Value JSON change.
  const handleJSONKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setJsonKeyValue(value);
  };

  return (
    <div className={`${classes.wrapper} ${className}`} {...others}>
      <CustomSelector
        label={conditionField.data_type}
        value={conditionField?.name}
        onChange={handleFieldNameChange}
        options={fields.map(i => ({ value: i.name, label: i.name }))}
        variant="filled"
        wrapperClass={classes.fieldName}
      />
      {conditionField?.data_type === DataTypeStringEnum.JSON ? (
        <TextField
          className={classes.key}
          label="key"
          variant="filled"
          value={jsonKeyValue}
          // size="small"
          onChange={handleJSONKeyChange}
          error={!isKeyLegal}
        />
      ) : null}
      <CustomSelector
        label="Logic"
        value={operator}
        onChange={handleOpChange}
        options={logicalOperators}
        variant="filled"
        wrapperClass={classes.logic}
      />
      <TextField
        className={classes.value}
        label="Value"
        variant="filled"
        value={conditionValue}
        onChange={handleValueChange}
        error={!isValueLegal}
      />
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onDelete}
        size="small"
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

Condition.displayName = 'Condition';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  wrapper: {
    minWidth: '466px',
    minHeight: '62px',
    background: theme.palette.background.paper,
    padding: theme.spacing(1.5, 2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {},
  fieldName: {
    minHeight: '38px',
    minWidth: '130px',
  },
  logic: { minHeight: '38px', minWidth: '100px', margin: '0 24px' },
  key: { minHeight: '38px', width: '150px', margin: '0 0' },
  value: { minHeight: '38px', minWidth: '130px' },
}));

export default Condition;
