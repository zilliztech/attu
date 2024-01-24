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
  ConsistencyLevelEnum,
} from '@/consts';
import CustomSelector from '@/components/customSelector/CustomSelector';
import EmptyDataDialog from '../dialogs/EmptyDataDialog';
import ImportSampleDialog from '../dialogs/ImportSampleDialog';

const Query = () => {
  // get collection name from url
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  // UI state
  const [tableLoading, setTableLoading] = useState<any>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [expression, setExpression] = useState<string>('');
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

  // UI ref
  const filterRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  // UI event handlers
  const handleFilterReset = async () => {
    // reset advanced filter
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    // update UI expression
    setExpression('');
    // reset query
    reset();
    // ensure not loading
    setTableLoading(null);
  };
  const handleFilterSubmit = async (expression: string) => {
    // update UI expression
    setExpression(expression);
    // update expression
    setExpr(expression);
  };
  const handlePageChange = async (e: any, page: number) => {
    console.log('handlePageChange', page);
    // do the query
    await query(page);
    // update page number
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
    await onDelete();
  };
  const onSelectChange = (value: any) => {
    setSelectedData(value);
  };
  const onDelete = async () => {
    // reset query
    reset();
    count(ConsistencyLevelEnum.Strong);
    await query(0, ConsistencyLevelEnum.Strong);
  };

  const {
    collection,
    currentPage,
    total,
    pageSize,
    expr,
    queryResult,
    setPageSize,
    setConsistencyLevel,
    setCurrentPage,
    setExpr,
    query,
    reset,
    count,
  } = useQuery({
    collectionName,
    onQueryStart: (expr: string = '') => {
      setTableLoading(true);
      if (expr === '') {
        handleFilterReset();
        return;
      }
    },
    onQueryFinally: () => {
      setTableLoading(false);
    },
  });

  // Format result list
  const queryResultMemo = useSearchResult(queryResult.data);

  // console.log('refresh');

  // page size change, we start query
  useEffect(() => {
    query();
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
            component: <ImportSampleDialog collection={collectionName} cb={onDelete} />,
          },
        });
      },
      label: btnTrans('importSampleData'),
      icon: 'add',
      // tooltip: collectionTrans('deleteTooltip'),
    },
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
      icon: 'deleteOutline',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <EmptyDataDialog
                cb={async () => {
                  openSnackBar(
                    successTrans('empty', {
                      name: collectionTrans('collection'),
                    })
                  );
                  await onDelete();
                }}
                collectionName={collectionName}
              />
            ),
          },
        });
      },
      disabled: () => total == 0,
      label: btnTrans('empty'),
      disabledTooltip: collectionTrans('emptyDataDisableTooltip'),
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
                // reset page
                setCurrentPage(0);
                if (expr !== expression) {
                  setExpr(expression);
                } else {
                  // ensure query
                  query();
                }
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
              if (expr !== expression) {
                setExpr(expression);
              } else {
                // ensure query
                query();
              }
            }}
          >
            {btnTrans('query')}
          </CustomButton>
        </div>
      </div>
      {tableLoading || queryResultMemo?.length ? (
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
          labelDisplayedRows={getLabelDisplayedRows(
            `(${queryResult.latency} ms)`
          )}
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
