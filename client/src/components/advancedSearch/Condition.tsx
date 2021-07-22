import React, { useState, useEffect, FC } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  TextField,
  MenuItem,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface ConditionProps {
  others?: object;
  onDelete: () => void;
  triggerChange: (data: TriggerChangeData) => void;
  fields: Field[];
  id: string;
  initData: any;
  className?: string;
}

interface Field {
  name: string;
  type: 'int' | 'float';
}

interface TriggerChangeData {
  field: Field;
  op: string;
  value: string;
  isCorrect: boolean;
  id: string;
}

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

    switch (type) {
      case 'int':
        setIsValueLegal(
          isIn
            ? regIntInterval.test(conditionValue)
            : regInt.test(conditionValue)
        );
        break;
      case 'float':
        setIsValueLegal(
          isIn
            ? regFloatInterval.test(conditionValue)
            : regFloat.test(conditionValue)
        );
        break;
      default:
        setIsValueLegal(false);
        break;
    }

    triggerChange({
      field: conditionField,
      op: operator,
      value: conditionValue,
      isCorrect: isValuelegal,
      id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionField, operator, conditionValue]);

  // Trigger change event if isValuelegal changed.
  useEffect(() => {
    triggerChange({
      field: conditionField,
      op: operator,
      value: conditionValue,
      isCorrect: isValuelegal,
      id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValuelegal]);

  const classes = useStyles();

  // Logic operator input change.
  const handleOpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperator(event.target.value);
  };
  // Field Name input change.
  const handleFieldNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
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
      <TextField
        className={classes.fieldName}
        label="Field Name"
        variant="filled"
        size="small"
        select
        onChange={handleFieldNameChange}
        value={conditionField?.name}
      >
        {fields.map((field: Field) => (
          <MenuItem key={field.name} value={field.name}>
            {field.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        className={classes.logic}
        label="Logic"
        variant="filled"
        size="small"
        select
        onChange={handleOpChange}
        defaultValue={LogicalOperators[0].value}
        value={operator}
      >
        {LogicalOperators.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        className={classes.value}
        label="Value"
        variant="filled"
        size="small"
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
      // borderRadius: '8px',
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
