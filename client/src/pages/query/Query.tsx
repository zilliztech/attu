import { useState, useEffect, useRef, useContext } from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { rootContext } from '@/context';
import { DataService } from '@/http';
import { useQuery, useSearchResult } from '@/hooks';
import { saveCsvAs } from '@/utils';
import EmptyCard from '@/components/cards/EmptyCard';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import AttuGrid from '@/components/grid/Grid';
import { ToolBarConfig } from '@/components/grid/Types';
import Filter from '@/components/advancedSearch';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import CustomToolBar from '@/components/grid/ToolBar';
import { getLabelDisplayedRows } from '../search/Utils';
import { getQueryStyles } from './Styles';
import {
  DYNAMIC_FIELD,
  DataTypeStringEnum,
  CONSISTENCY_LEVEL_OPTIONS,
} from '@/consts';
import CustomSelector from '@/components/customSelector/CustomSelector';

const Query = () => {
  // get collection name from url
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  // UI state
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [expression, setExpression] = useState<string>('');
  // latency
  const [latency, setLatency] = useState<number>(0);
  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  // icons
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;
  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  // classes
  const classes = getQueryStyles();

  // Format result list
  const queryResultMemo = useSearchResult(queryResult);

  // UI ref
  const filterRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  // UI event handlers
  const handleFilterReset = async () => {
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    setExpr('');
    setExpression('');
    setTableLoading(null);
    setQueryResult(null);
  };

  const handleFilterSubmit = async (expression: string) => {
    setExpression(expression);
    setExpr(expression);
    await query(expression);
  };

  const handlePageChange = async (e: any, page: number) => {
    const expr = getExpr(page);
    await query(expr);
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    await DataService.deleteEntities(collectionName, {
      expr: `${collection.primaryKey.value} in [${selectedData
        .map(v =>
          collection.primaryKey.type === DataTypeStringEnum.VarChar
            ? `"${v[collection.primaryKey.value]}"`
            : v[collection.primaryKey.value]
        )
        .join(',')}]`,
    });
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: collectionTrans('entities') }));
    setSelectedData([]);
    await query(expr);
  };

  const onSelectChange = (value: any) => {
    setSelectedData(value);
  };

  const {
    currentPage,
    total,
    pageSize,
    setPageSize,
    expr,
    collection,
    setConsistencyLevel,
    setCurrentPage,
    getExpr,
    setExpr,
    query,
  } = useQuery({
    collectionName,
    expr: '',
    data: queryResultMemo || [],
    onQueryStart: (expr: string = '') => {
      setTableLoading(true);
      if (expr === '') {
        handleFilterReset();
        return;
      }
    },
    onQueryEnd: (res: { latency: number; data: any[] }) => {
      setQueryResult(res.data);
      setLatency(res.latency);
    },
    onQueryFinally: () => {
      setTableLoading(false);
    },
  });

  // page size change, we start query
  useEffect(() => {
    query(expr);
  }, [pageSize]);

  const toolbarConfigs: ToolBarConfig[] = [
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DeleteTemplate
                label={btnTrans('drop')}
                title={dialogTrans('deleteTitle', {
                  type: collectionTrans('entities'),
                })}
                text={collectionTrans('deleteDataWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: btnTrans('delete'),
      icon: 'delete',
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteTooltip'),
      disabled: () => selectedData.length === 0,
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        saveCsvAs(queryResult, 'milvus_query_result.csv');
      },
      label: btnTrans('export'),
      icon: 'download',
      tooltip: collectionTrans('downloadTooltip'),
      disabledTooltip: collectionTrans('downloadDisabledTooltip'),
      disabled: () => !queryResult?.length,
    },
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={classes.root}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />
      <div className={classes.toolbar}>
        <div className="left">
          <TextField
            className="textarea"
            InputProps={{
              classes: {
                root: 'textfield',
                multiline: 'multiline',
              },
            }}
            value={expression}
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
              setExpression(e.target.value as string);
            }}
            InputLabelProps={{ shrink: true }}
            label={collectionTrans('exprPlaceHolder')}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // Do code here
                setCurrentPage(0);
                setExpr(expression)
                query(expression);
                e.preventDefault();
              }
            }}
            inputRef={inputRef}
          />
          <Filter
            ref={filterRef}
            title="Advanced Filter"
            fields={collection.fields.filter(
              (i: any) =>
                i.type !== DataTypeStringEnum.FloatVector &&
                i.type !== DataTypeStringEnum.BinaryVector
            )}
            filterDisabled={false}
            onSubmit={handleFilterSubmit}
            showTitle={false}
            showTooltip={false}
          />
          {/* </div> */}
          <CustomSelector
            options={CONSISTENCY_LEVEL_OPTIONS}
            value={collection.consistencyLevel}
            label={collectionTrans('consistency')}
            wrapperClass={classes.selector}
            variant="filled"
            onChange={(e: { target: { value: unknown } }) => {
              const consistency = e.target.value as string;
              setConsistencyLevel(consistency);
            }}
          />
        </div>
        <div className="right">
          <CustomButton className="btn" onClick={handleFilterReset}>
            <ResetIcon classes={{ root: 'icon' }} />
            {btnTrans('reset')}
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={() => {
              setCurrentPage(0);
              setExpr(expr);
              query(expr);
            }}
          >
            {btnTrans('query')}
          </CustomButton>
        </div>
      </div>
      {tableLoading || queryResult?.length ? (
        <AttuGrid
          toolbarConfigs={[]}
          colDefinitions={collection.fields.map((i: any) => ({
            id: i.name,
            align: 'left',
            disablePadding: false,
            needCopy: true,
            label:
              i.name === DYNAMIC_FIELD ? searchTrans('dynamicFields') : i.name,
          }))}
          primaryKey={collection.primaryKey.value}
          openCheckBox={true}
          isLoading={!!tableLoading}
          rows={queryResultMemo}
          rowCount={total}
          selected={selectedData}
          setSelected={onSelectChange}
          page={currentPage}
          onPageChange={handlePageChange}
          setRowsPerPage={setPageSize}
          rowsPerPage={pageSize}
          labelDisplayedRows={getLabelDisplayedRows(`(${latency} ms)`)}
        />
      ) : (
        <EmptyCard
          wrapperClass={`page-empty-card ${classes.emptyCard}`}
          icon={<VectorSearchIcon />}
          text={
            queryResult?.length === 0
              ? searchTrans('empty')
              : collectionTrans('startTip')
          }
        />
      )}
    </div>
  );
};

export default Query;
