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
import { LOGICAL_OPERATORS } from '../../consts/Util';
import { DataTypeStringEnum } from '../../pages/collections/Types';

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
  const [conditionValue, setConditionValue] = useState(initData?.value || '');
  const [isValuelegal, setIsValueLegal] = useState(
    initData?.isCorrect || false
  );

  /**
   * Check condition's value by field's and operator's type.
   * Trigger condition change event.
   */
  useEffect(() => {
    const regInt = /^\d+$/;
    const regFloat = /^\d+\.\d+$/;
    const regIntInterval = /^\[\d+(,\d+)*\]$/;
    const regFloatInterval = /^\[\d+\.\d+(,\d+\.\d+)*\]$/;

    const type = conditionField?.type;
    const isIn = operator === 'in';
    let isLegal = false;
    const conditionValueWithNoSpace = conditionValue.replaceAll(' ', '');

    switch (type) {
      case DataTypeStringEnum.Int8:
      case DataTypeStringEnum.Int16:
      case DataTypeStringEnum.Int32:
      case DataTypeStringEnum.Int64:
        // case DataTypeStringEnum:
        isLegal = isIn
          ? regIntInterval.test(conditionValueWithNoSpace)
          : regInt.test(conditionValueWithNoSpace);
        break;
      case DataTypeStringEnum.Float:
      case DataTypeStringEnum.Double:
      case DataTypeStringEnum.FloatVector:
        isLegal = isIn
          ? regFloatInterval.test(conditionValueWithNoSpace)
          : regFloat.test(conditionValueWithNoSpace);
        break;
      case DataTypeStringEnum.Bool:
        const legalValues = ['false', 'true'];
        isLegal = legalValues.includes(conditionValueWithNoSpace);
        break;
      case DataTypeStringEnum.VarChar:
        isLegal = conditionValueWithNoSpace !== '';
        break;
      default:
        isLegal = false;
        break;
    }
    setIsValueLegal(isLegal);
    triggerChange(id, {
      field: conditionField,
      op: operator,
      value: conditionValue,
      isCorrect: isLegal,
      id,
    });
    // No need for 'id' and 'triggerChange'.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionField, operator, conditionValue]);

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
    const type = conditionField?.type;
    setConditionValue(
      type === DataTypeStringEnum.VarChar ? `"${value}"` : value
    );
  };

  return (
    <div className={`${classes.wrapper} ${className}`} {...others}>
      <CustomSelector
        label="Field Name"
        value={conditionField?.name}
        onChange={handleFieldNameChange}
        options={fields.map(i => ({ value: i.name, label: i.name }))}
        variant="filled"
        wrapperClass={classes.fieldName}
      />
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
        // size="small"
        onChange={handleValueChange}
        error={!isValuelegal}
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
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    closeButton: {},
    fieldName: {
      minHeight: '38px',
      minWidth: '130px',
    },
    logic: { minHeight: '38px', minWidth: '70px', margin: '0 24px' },
    value: { minHeight: '38px', minWidth: '130px' },
  })
);

export default Condition;
