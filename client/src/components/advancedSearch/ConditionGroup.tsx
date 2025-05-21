import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, Box } from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import ConditionItem from './Condition';
import icons from '../icons/Icons';
import CustomButton from '../customButton/CustomButton';
import type { FC } from 'react';
import type {
  ConditionGroupProps,
  BinaryLogicalOpProps,
  AddConditionProps,
} from './Types';
import { ThemeContext } from '@emotion/react';

// "And & or" operator component.
const BinaryLogicalOp: FC<BinaryLogicalOpProps> = props => {
  const { onChange, initValue = 'and' } = props;
  const [operator, setOperator] = useState(initValue);
  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newOp: string) => {
      if (newOp !== null) {
        setOperator(newOp);
        onChange(newOp);
      }
    },
    [onChange]
  );
  return (
    <Box
      sx={(theme: Theme) => ({
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.paper,
      })}
      className={`op-${operator}`}
    >
      <ToggleButtonGroup
        value={operator}
        exclusive
        onChange={handleChange}
        aria-label="Binary Logical Operator"
      >
        <ToggleButton
          value="and"
          aria-label="And"
          sx={(theme: Theme) => ({
            borderRadius: 0,
            width: 52,
            borderTop:
              operator === 'and'
                ? 'none'
                : `1px solid ${theme.palette.divider}`,
            borderBottom:
              operator === 'and'
                ? 'none'
                : `1px solid ${theme.palette.divider}`,
          })}
        >
          AND
        </ToggleButton>
        <ToggleButton
          value="or"
          aria-label="Or"
          sx={(theme: Theme) => ({
            borderRadius: 0,
            borderTop:
              operator === 'and'
                ? 'none'
                : `1px solid ${theme.palette.divider}`,
            borderBottom:
              operator === 'and'
                ? 'none'
                : `1px solid ${theme.palette.divider}`,
          })}
        >
          OR
        </ToggleButton>
      </ToggleButtonGroup>
      <div className="op-split" />
    </Box>
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
      sx={{ margin: 1 }}
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

  // 已去除 generateClassName 逻辑

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
          />
        );
        prev.push(
          <AddCondition
            key={`${condition.id}-add`}
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
          />
        );
        prev.push(
          <BinaryLogicalOp
            key={`${condition.id}-op`}
            onChange={newOp => {
              changeBinaryLogicalOp(newOp, condition.id);
            }}
          />
        );
      }
      return prev;
    }, []);
    return results;
  };

  return (
    <Box
      sx={(theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .op-or': {
          margin: '8px 0',
        },
      })}
    >
      {generateConditionItems(flatConditions)}
      {flatConditions?.length === 0 && (
        <AddCondition
          onClick={() => {
            addCondition();
          }}
        />
      )}
    </Box>
  );
};

ConditionGroup.displayName = 'ConditionGroup';

export default ConditionGroup;
