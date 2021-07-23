import React, { useState, useEffect, FC } from 'react';
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

// Todo: Move to corrsponding Constant file.
// Static logical operators.
const LogicalOperators = [
  {
    value: '<',
    label: '<',
  },
  {
    value: '<=',
    label: '<=',
  },
  {
    value: '>',
    label: '>',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '==',
    label: '==',
  },
  {
    value: '!=',
    label: '!=',
  },
  {
    value: 'in',
    label: 'in',
  },
];

const Condition: FC<ConditionProps> = props => {
  const {
    onDelete,
    triggerChange,
    fields = [],
    id,
    initData,
    className,
    ...others
  } = props;
  const [operator, setOperator] = useState(
    initData?.op || LogicalOperators[0].value
  );
  const [conditionField, setConditionField] = useState<Field | any>(
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
    const regIntInterval = /^\[\d+,\d+\]$/;
    const regFloatInterval = /^\[\d+\.\d+,\d+\.\d+]$/;

    const type = conditionField?.type;
    const isIn = operator === 'in';
    let isLegal = false;

    switch (type) {
      case 'int':
        isLegal = isIn
          ? regIntInterval.test(conditionValue)
          : regInt.test(conditionValue);
        break;
      case 'float':
        isLegal = isIn
          ? regFloatInterval.test(conditionValue)
          : regFloat.test(conditionValue);
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
        options={LogicalOperators}
        variant="filled"
        wrapperClass={classes.logic}
      />
      <TextField
        className={classes.value}
        label="Value"
        variant="filled"
        // size="small"
        onChange={handleValueChange}
        value={conditionValue}
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

Condition.defaultProps = {
  onDelete: () => {},
  triggerChange: () => {},
  fields: [],
  id: '',
  className: '',
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
