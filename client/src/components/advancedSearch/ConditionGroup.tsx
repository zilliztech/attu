import React, { useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import ConditionItem from './Condition';
import icons from '../icons/Icons';
import CustomButton from '../customButton/CustomButton';
import {
  ConditionGroupProps,
  BinaryLogicalOpProps,
  AddConditionProps,
} from './Types';

// "And & or" operator component.
const BinaryLogicalOp: FC<BinaryLogicalOpProps> = props => {
  const { onChange, className, initValue = 'and' } = props;
  const [operator, setOperator] = useState(initValue);
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newOp: string
  ) => {
    if (newOp !== null) {
      setOperator(newOp);
      onChange(newOp);
    }
  };
  return (
    <>
      <div className={`${className} op-${operator}`}>
        <ToggleButtonGroup
          value={operator}
          exclusive
          onChange={handleChange}
          aria-label="Binary Logical Operator"
        >
          <ToggleButton value="and" aria-label="And">
            AND
          </ToggleButton>
          <ToggleButton value="or" aria-label="Or">
            OR
          </ToggleButton>
        </ToggleButtonGroup>
        <div className="op-split" />
      </div>
    </>
  );
};

// "+ Add condition" component.
const AddCondition: FC<AddConditionProps> = props => {
  const { className, onClick } = props;
  const { t: searchTrans } = useTranslation('search');
  const AddIcon = icons.add;

  return (
    <CustomButton
      onClick={onClick}
      color="primary"
      className={className}
      startIcon={<AddIcon />}
    >
      {searchTrans('addCondition')}
    </CustomButton>
  );
};

// Condition group component which contains of BinaryLogicalOp, AddCondition and ConditionItem.
const ConditionGroup = (props: ConditionGroupProps) => {
  const {
    fields = [],
    handleConditions = {},
    conditions: flatConditions = [],
  } = props;
  const {
    addCondition,
    removeCondition,
    changeBinaryLogicalOp,
    updateConditionData,
  } = handleConditions;

  const classes = useStyles();

  const generateClassName = (conditions: any, currentIndex: number) => {
    let className = '';
    if (currentIndex === 0 || conditions[currentIndex - 1].type === 'break') {
      className += 'radius-top';
    }
    if (
      currentIndex === conditions.length - 1 ||
      conditions[currentIndex + 1].type === 'break'
    ) {
      className ? (className = 'radius-all') : (className = 'radius-bottom');
    }
    return className;
  };

  // Generate condition items with operators and add condition btn.
  const generateConditionItems = (conditions: any[]) => {
    const conditionsLength = conditions.length;
    const results = conditions.reduce((prev: any, condition, currentIndex) => {
      if (currentIndex === conditionsLength - 1) {
        prev.push(
          <ConditionItem
            key={condition.id}
            id={condition.id}
            onDelete={() => {
              removeCondition(condition.id);
            }}
            fields={fields}
            triggerChange={updateConditionData}
            initData={condition?.data}
            className={generateClassName(conditions, currentIndex)}
          />
        );
        prev.push(
          <AddCondition
            key={`${condition.id}-add`}
            className={classes.addBtn}
            onClick={() => {
              addCondition(condition.id);
            }}
          />
        );
      } else if (condition.type === 'break') {
        prev.pop();
        prev.push(
          <AddCondition
            key={`${condition.id}-add`}
            className={classes.addBtn}
            onClick={() => {
              addCondition(condition.id, true);
            }}
          />
        );
        prev.push(
          <BinaryLogicalOp
            key={`${condition.id}-op`}
            onChange={newOp => {
              changeBinaryLogicalOp(newOp, condition.id);
            }}
            className={classes.binaryLogicOp}
            initValue="or"
          />
        );
      } else if (condition.type === 'condition') {
        prev.push(
          <ConditionItem
            key={condition.id}
            id={condition.id}
            onDelete={() => {
              removeCondition(condition.id);
            }}
            fields={fields}
            triggerChange={updateConditionData}
            initData={condition?.data}
            className={generateClassName(conditions, currentIndex)}
          />
        );
        prev.push(
          <BinaryLogicalOp
            key={`${condition.id}-op`}
            onChange={newOp => {
              changeBinaryLogicalOp(newOp, condition.id);
            }}
            className={classes.binaryLogicOp}
          />
        );
      }
      return prev;
    }, []);
    return results;
  };

  return (
    <div className={classes.wrapper}>
      {generateConditionItems(flatConditions)}
      {flatConditions?.length === 0 && (
        <AddCondition
          className={classes.addBtn}
          onClick={() => {
            addCondition();
          }}
        />
      )}
    </div>
  );
};

ConditionGroup.displayName = 'ConditionGroup';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '& .op-or': {
      backgroundColor: 'unset',
      margin: '16px 0',
    },
  },
  addBtn: {},
  binaryLogicOp: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& .op-split': {
      height: '1px',
      backgroundColor: '#E9E9ED',
      width: '100%',
    },
    '& button': {
      width: '42px',
      height: '32px',
      color: theme.palette.attuDark.main,
    },
    '& button.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: '#FFFFFF',
    },
    '& button.Mui-selected:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#FFFFFF',
    },
  },
}));

export default ConditionGroup;
