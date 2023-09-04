import React, { useState, useEffect, FC, useMemo } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  TextField,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { ConditionProps, Field } from './Types';
import CustomSelector from '../customSelector/CustomSelector';
import { LOGICAL_OPERATORS } from '@/consts';
import { DataTypeStringEnum } from '@/pages/collections/Types';
import { formatValue, checkValue } from './utils';

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
  const [conditionField, setConditionField] = useState<Field>(
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
    const type = conditionField?.type;
    const conditionValueWithNoSpace = conditionValue.replaceAll(' ', '');
    let isKeyLegal = false;
    let isLegal = checkValue({
      value: conditionValueWithNoSpace,
      type,
      operator,
    });

    // if type is json, check the json key is valid
    if (type === DataTypeStringEnum.JSON) {
      isKeyLegal = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(jsonKeyValue.trim());
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
    if (conditionField.type === DataTypeStringEnum.Bool) {
      const data = LOGICAL_OPERATORS.filter(v => v.value === '==');
      setOperator(data[0].value);
      // bool only support ==
      return data;
    }
    return LOGICAL_OPERATORS;
  }, [conditionField]);

  // Logic operator input change.
  const handleOpChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setOperator(event.target.value);
  };
  // Field Name input change.
  const handleFieldNameChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
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
        label={conditionField.type}
        value={conditionField?.name}
        onChange={handleFieldNameChange}
        options={fields.map(i => ({ value: i.name, label: i.name }))}
        variant="filled"
        wrapperClass={classes.fieldName}
      />
      {conditionField?.type === DataTypeStringEnum.JSON ? (
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    wrapper: {
      minWidth: '466px',
      minHeight: '62px',
      background: '#FFFFFF',
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
  })
);

export default Condition;
