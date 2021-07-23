import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  Button,
  Chip,
  Tooltip,
} from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import AdvancedDialog from './Dialog';
import { FilterProps, ConditionData } from './Types';
import { generateIdByHash } from '../../utils/Common';

const Filter = function Filter(props: FilterProps) {
  const {
    title,
    showTitle,
    className,
    tooltipPlacement,
    onSubmit,
    fields,
    ...others
  } = props;
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [conditionSum, setConditionSum] = useState(0);
  const [flatConditions, setFlatConditions] = useState<any[]>([]);
  const [initConditions, setInitConditions] = useState<any[]>([]);
  const [isConditionsLegal, setIsConditionsLegal] = useState(false);
  const [filterExpression, setFilterExpression] = useState('');

  useEffect(() => {
    setInitConditions(flatConditions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check all conditions are all correct.
  useEffect(() => {
    // Calc the sum of conditions.
    setConditionSum(flatConditions.filter(i => i.type === 'condition').length);
    for (let i = 0; i < flatConditions.length; i++) {
      const { data, type } = flatConditions[i];
      if (type !== 'condition') continue;
      if (!data) {
        setIsConditionsLegal(false);
        return;
      }
      if (!data.isCorrect) {
        setIsConditionsLegal(data.isCorrect);
        return;
      }
    }
    setIsConditionsLegal(true);
    generateExpression(flatConditions, setFilterExpression);
  }, [flatConditions]);

  const setFilteredFlatConditions = (conditions: any[]) => {
    const newConditions = conditions.reduce((prev, item, currentIndex) => {
      if (prev.length === 0 && item.type !== 'condition') return prev;
      if (
        prev.length &&
        item.type !== 'condition' &&
        prev[prev.length - 1].type !== 'condition'
      )
        return prev;
      return [...prev, item];
    }, []);
    setFlatConditions(newConditions);
  };

  const generateExpression = (conditions: any[], func: any) => {
    const expression = conditions.reduce((prev, item) => {
      const { type, data } = item;
      if (type === 'break') return `${prev} || `;
      const {
        field: { name },
        op,
        value,
      } = data;
      return `${prev}${
        prev && !prev.endsWith('|| ') ? ' && ' : ''
      }${name} ${op} ${value}`;
    }, '');
    func(expression);
  };

  /**
   * Insert "OR" operator into specified position.
   * @param targetId The break operator will be inserted after the target one.
   */
  const addBreak = (targetId?: string) => {
    if (!targetId) {
      setFilteredFlatConditions([
        ...flatConditions,
        { id: generateIdByHash('break'), type: 'break' },
        {
          id: generateIdByHash('condition'),
          type: 'condition',
          field: '',
          operator: '<',
          value: '',
        },
      ]);
      return;
    }
    const formerConditons = [...flatConditions];
    const newConditions = formerConditons.reduce((prev, item) => {
      if (item.id === targetId) {
        return [...prev, item, { id: generateIdByHash('break'), type: 'break' }];
      }
      return [...prev, item];
    }, []);
    setFilteredFlatConditions(newConditions);
  };
  /**
   * Remove "OR" operator in specified position.
   * @param targetId Remove the break operator after the target one.
   */
  const removeOrOp = (targetId: string) => {
    setFilteredFlatConditions(flatConditions.filter(i => i.id !== targetId));
  };
  /**
   * Add new condition to specified position.
   * @param targetId Position where new condition item will be inserted.
   * Will be pushed to tail if empty.
   * @param beforeTarget Will be inserted before the target item.
   */
  const addCondition = (targetId?: string, beforeTarget?: boolean) => {
    const formerConditons = [...flatConditions];
    const newItem = {
      id: generateIdByHash('condition'),
      type: 'condition',
      field: '',
      operator: '<',
      value: '',
    };
    if (!targetId) {
      formerConditons.push(newItem);
      setFilteredFlatConditions(formerConditons);
      return;
    }
    const newConditions = formerConditons.reduce((prev, item) => {
      if (item.id === targetId) {
        const newItems = [
          item,
          {
            id: generateIdByHash('condition'),
            type: 'condition',
            field: '',
            operator: '<',
            value: '',
          },
        ];
        beforeTarget && newItems.reverse();
        return [...prev, ...newItems];
      }
      return [...prev, item];
    }, []);
    setIsConditionsLegal(false);
    setFilteredFlatConditions(newConditions);
  };
  /**
   * Remove condition from specified position.
   * @param targetId Position where new condition item will be removed.
   */
  const removeCondition = (targetId: string) => {
    setFilteredFlatConditions(flatConditions.filter(i => i.id !== targetId));
  };
  const changeBinaryLogicalOp = (value: string, targetId: string) => {
    if (value === 'or') {
      addBreak(targetId);
    } else if (value === 'and') {
      removeOrOp(targetId);
    }
  };
  /**
   * Update specified condition's data.
   * @param id Specify one item that will be updated.
   * @param data Data that will be updated to condition.
   */
  const updateConditionData = (
    id: string,
    data: ConditionData
  ) => {
    const formerFlatConditions = flatConditions.map(i => {
      if (i.id === id) return { ...i, data };
      return i;
    });
    setFilteredFlatConditions(formerFlatConditions);
  };
  // Reset conditions.
  const resetConditions = () => {
    setIsConditionsLegal(false);
    setFilteredFlatConditions([
      {
        id: generateIdByHash(),
        type: 'condition',
        field: '',
        operator: '<',
        value: '',
      },
    ]);
  };
  const getConditionsSum = () => {
    const conds = flatConditions.filter(i => i.type === 'condition');
    return conds.length;
  };

  const handleConditions = {
    addBreak,
    removeOrOp,
    addCondition,
    removeCondition,
    changeBinaryLogicalOp,
    updateConditionData,
    resetConditions,
    getConditionsSum,
    setFilteredFlatConditions,
    setIsConditionsLegal,
    setFilterExpression,
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDeleteAll = () => {
    setFlatConditions([]);
    setInitConditions([]);
    onSubmit('');
  };
  const handleCancel = () => {
    setOpen(false);
    handleFallback();
  };
  const handleSubmit = () => {
    onSubmit(filterExpression);
    setInitConditions(flatConditions);
    setOpen(false);
  };
  const handleReset = () => {
    setFilteredFlatConditions([
      {
        id: generateIdByHash('condition'),
        type: 'condition',
        field: '',
        operator: '<',
        value: '',
      },
    ]);
  };
  const handleFallback = () => {
    setFilteredFlatConditions(initConditions);
  };

  return (
    <>
      <div className={`${classes.wrapper} ${className}`} {...others}>
        <Button className={`${classes.afBtn} af-btn`} onClick={handleClickOpen}>
          <FilterListIcon />
          {showTitle ? title : ''}
        </Button>
        {conditionSum > 0 && (
          <Tooltip
            arrow
            interactive
            title={filterExpression}
            placement={tooltipPlacement}
          >
            <Chip
              label={conditionSum}
              onDelete={handleDeleteAll}
              variant="outlined"
              size="small"
            />
          </Tooltip>
        )}
        {open && (
          <AdvancedDialog
            open={open}
            onClose={handleClose}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            onReset={handleReset}
            title="Advanced Filter"
            fields={fields}
            handleConditions={handleConditions}
            conditions={flatConditions}
            isLegal={isConditionsLegal}
            expression={filterExpression}
          />
        )}
      </div>
    </>
  );
};

Filter.defaultProps = {
  className: '',
  showTitle: true,
  tooltipPlacement: 'top',
  fields: [],
  onSubmit: () => {},
};

Filter.displayName = 'AdvancedFilter';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {},
    afBtn: {
      color: '#06AFF2',
    },
  })
);

export default Filter;
