import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import { Toolbar } from '../../StyledComponents';
import { DYNAMIC_FIELD, CONSISTENCY_LEVEL_OPTIONS } from '@/consts';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CustomMultiSelector from '@/components/customSelector/CustomMultiSelector';
import OptimizedInput from './OptimizedInput';
import type { QueryState } from '../../types';
import { CollectionFullObject } from '@server/types';

interface QueryToolbarProps {
  collection: CollectionFullObject;
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
  exprInputRef: React.MutableRefObject<string>;
  handleExprChange: (value: string) => void;
  handleExprKeyDown: (e: any) => void;
  handleFilterSubmit: (expression: string) => Promise<void>;
  handleFilterReset: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  forceDisabled?: boolean;
}

const QueryToolbar = (props: QueryToolbarProps) => {
  const {
    collection,
    queryState,
    setQueryState,
    exprInputRef,
    handleExprChange,
    handleExprKeyDown,
    handleFilterSubmit,
    handleFilterReset,
    setCurrentPage,
    forceDisabled = false,
  } = props;

  // translations
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

  // icons
  const ResetIcon = icons.refresh;

  return (
    <Toolbar>
      <div className="left">
        <OptimizedInput
          value={exprInputRef.current}
          onChange={handleExprChange}
          onKeyDown={handleExprKeyDown}
          disabled={!collection.loaded || forceDisabled}
          fields={collection.schema.scalarFields}
          onSubmit={handleFilterSubmit}
        />

        <FormControl
          variant="filled"
          className="selector"
          disabled={!collection.loaded || forceDisabled}
          sx={{ minWidth: 120 }}
        >
          <InputLabel>{collectionTrans('consistency')}</InputLabel>
          <Select
            value={queryState.consistencyLevel}
            label={collectionTrans('consistency')}
            onChange={e => {
              const consistency = e.target.value as string;
              setQueryState({
                ...queryState,
                consistencyLevel: consistency,
              });
            }}
          >
            {CONSISTENCY_LEVEL_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="right">
        <CustomMultiSelector
          options={queryState.fields.map(field => ({
            label:
              field.name === DYNAMIC_FIELD
                ? searchTrans('dynamicFields')
                : field.name,
            value: field.name,
          }))}
          values={queryState.outputFields}
          label={searchTrans('outputFields')}
          variant="filled"
          wrapperClass="outputs selector"
          onChange={(e: { target: { value: unknown } }) => {
            const values = e.target.value as string[];
            // prevent deselecting the last option
            if (values.length === 0) {
              return;
            }
            // sort output fields by schema order
            const newOutputFields = [...values].sort(
              (a, b) =>
                queryState.fields.findIndex(f => f.name === a) -
                queryState.fields.findIndex(f => f.name === b)
            );

            setQueryState({
              ...queryState,
              outputFields: newOutputFields,
            });
          }}
          renderValue={(selected: unknown) => {
            const selectedArray = selected as string[];
            return (
              <span>{`${selectedArray.length} ${commonTrans(
                selectedArray.length > 1 ? 'grid.fields' : 'grid.field'
              )}`}</span>
            );
          }}
          disabled={!collection.loaded || forceDisabled}
          sx={{
            width: '120px',
            marginTop: '1px',
            '& .MuiSelect-select': {
              fontSize: '14px',
              height: '28px',
              lineHeight: '28px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '14px',
            },
            '& .MuiMenuItem-root': {
              padding: '2px 14px',
              fontSize: '14px',
            },
            '& .MuiCheckbox-root': {
              padding: '4px',
            },
            '& .MuiListItemText-root': {
              margin: '0',
            },
          }}
        />
        <CustomButton
          className="btn"
          onClick={handleFilterReset}
          disabled={!collection.loaded || forceDisabled}
          startIcon={<ResetIcon classes={{ root: 'icon' }} />}
        >
          {btnTrans('reset')}
        </CustomButton>
        <CustomButton
          className="btn"
          variant="contained"
          onClick={() => {
            setCurrentPage(0);
            // set expr
            setQueryState({
              ...queryState,
              expr: exprInputRef.current,
              tick: queryState.tick + 1,
            });
          }}
          disabled={!collection.loaded || forceDisabled}
        >
          {btnTrans('query')}
        </CustomButton>
      </div>
    </Toolbar>
  );
};

export default QueryToolbar;
