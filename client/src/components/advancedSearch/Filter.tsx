import { forwardRef, useState, useEffect, useImperativeHandle, useRef } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { generateIdByHash } from '@/utils/Common';
import AdvancedDialog from './Dialog';
import CustomButton from '../customButton/CustomButton';
import type { FilterProps, ConditionData } from './Types';

const Filter = forwardRef((props: FilterProps, ref) => {
  const {
    title = 'title',
    showTitle = true,
    showTooltip = true,
    className = '',
    filterDisabled = false,
    tooltipPlacement = 'top',
    onSubmit,
    fields = [],
    ...others
  } = props;

  // i18n
  const { t: searchTrans } = useTranslation('search');

  const [open, setOpen] = useState(false);
  const [flatConditions, setFlatConditions] = useState<any[]>([]);
  const [initConditions, setInitConditions] = useState<any[]>([]);
  const [isConditionsLegal, setIsConditionsLegal] = useState(false);
  const [filterExpression, setFilterExpression] = useState('');
  
  // Use ref to track previous expression to prevent unnecessary updates
  const prevExpressionRef = useRef<string>('');

  const FilterIcon = icons.filter;

  // if fields if empty array, reset all conditions
  useEffect(() => {
    if (fields.length === 0) {
      setFlatConditions([]);
      setInitConditions([]);
    }
  }, [fields]);

  // Check all conditions are all correct.
  useEffect(() => {
    // Calc the sum of conditions.
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
    
    // Only generate expression if conditions are legal
    if (flatConditions.length > 0) {
      generateExpression(flatConditions, setFilterExpression);
    }
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
        jsonKey,
        value,
      } = data;

      let n = name;

      // if type is json, format json expression
      if (data.field.data_type === 'JSON') {
        n = `${name}["${jsonKey}"]`;
      }

      let newExpr = `${n} ${op} ${value}`;

      // rewrite expression if the op is JSON_CONTAINS/ARRAY_CONTAINS
      if (
        op === 'JSON_CONTAINS' ||
        op === 'ARRAY_CONTAINS' ||
        op === 'TEXT_MATCH'
      ) {
        newExpr = `${op}(${n}, ${value})`;
      }
      // rewrite expression if the op is ARRAY_CONTAINS_ALL/ARRAY_CONTAINS_ANY
      if (op === 'ARRAY_CONTAINS_ALL' || op === 'ARRAY_CONTAINS_ANY') {
        newExpr = `${op}(${n}, ${value})`;
      }
      // rewrite expression if the op is JSON_CONTAINS_ANY/JSON_CONTAINS_ANY
      if (op === 'JSON_CONTAINS_ALL' || op === 'JSON_CONTAINS_ANY') {
        newExpr = `${op}(${n}, ${value})`;
      }
      return `${prev}${prev && !prev.endsWith('|| ') ? ' && ' : ''}${newExpr}`;
    }, '');
    func(expression);
  };

  /**
   * Insert "OR" operator into specified position.
   * @param targetId The break operator will be inserted after the target one.
   */
  const addOrOp = (targetId?: string) => {
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
    const formerConditions = [...flatConditions];
    const newConditions = formerConditions.reduce((prev, item) => {
      if (item.id === targetId) {
        return [
          ...prev,
          item,
          { id: generateIdByHash('break'), type: 'break' },
        ];
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
    const formerConditions = [...flatConditions];
    const newItem = {
      id: generateIdByHash('condition'),
      type: 'condition',
      field: '',
      operator: '<',
      value: '',
    };
    if (!targetId) {
      formerConditions.push(newItem);
      setFilteredFlatConditions(formerConditions);
      return;
    }
    const newConditions = formerConditions.reduce((prev, item) => {
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
      addOrOp(targetId);
    } else if (value === 'and') {
      removeOrOp(targetId);
    }
  };
  /**
   * Update specified condition's data.
   * @param id Specify one item that will be updated.
   * @param data Data that will be updated to condition.
   */
  const updateConditionData = (id: string, data: ConditionData) => {
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
    addOrOp,
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
  // Only reset current conditions. Former conditions are remained.
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
  // Reset all conditions(both current and former).
  const handleHardReset = () => {
    setInitConditions([]);
    handleReset();
  };
  const handleFallback = () => {
    setFilteredFlatConditions(initConditions);
  };
  // Expose func
  // useImperativeHandle customizes the instance value that is exposed to parent components when using ref.
  // https://reactjs.org/docs/hooks-reference.html#useimperativehandle
  useImperativeHandle(ref, () => ({
    // Expose handleHardReset, parent components can call it by `ref.current.getReset()`
    getReset() {
      handleHardReset();
    },
  }));

  return (
    <>
      <Box className={className} {...others}>
        <CustomButton
          disabled={filterDisabled}
          sx={{
            color: theme => theme.palette.primary.main,
            minWidth: 32,
            p: '8px 0',
            '& .MuiButton-endIcon': { ml: 0 },
          }}
          onClick={handleClickOpen}
          size="small"
          endIcon={<FilterIcon />}
        >
          {showTitle ? title : ''}
        </CustomButton>
        {showTooltip && initConditions.length > 0 && (
          <Tooltip arrow title={filterExpression} placement={tooltipPlacement}>
            <Chip
              label={initConditions.filter(i => i.type === 'condition').length}
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
            title={searchTrans('filterExpr')}
            fields={fields}
            handleConditions={handleConditions}
            conditions={flatConditions}
            isLegal={isConditionsLegal}
            expression={filterExpression}
          />
        )}
      </Box>
    </>
  );
});

Filter.displayName = 'AdvancedFilter';

export default Filter;
