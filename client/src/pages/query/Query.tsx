import { FC, useEffect, useState, useRef, useContext } from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import { Collection, DataService } from '@/http';
import { usePaginationHook, useSearchResult } from '@/hooks';
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

const Query: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [expression, setExpression] = useState('');
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [primaryKey, setPrimaryKey] = useState<{ value: string; type: string }>(
    { value: '', type: DataTypeStringEnum.Int64 }
  );
  const [consistency_level, setConsistency_level] = useState<string>('');

  // latency
  const [latency, setLatency] = useState<number>(0);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;

  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const classes = getQueryStyles();

  // Format result list
  const queryResultMemo = useSearchResult(queryResult, classes);

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(queryResultMemo || []);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  const getFields = async (collectionName: string) => {
    const collection = await Collection.getCollectionInfo(collectionName);
    const schemaList = collection.fields;

    const nameList = schemaList.map(v => ({
      name: v.name,
      type: v.fieldType,
    }));

    // if the dynamic field is enabled, we add $meta column in the grid
    if (collection.enableDynamicField) {
      nameList.push({
        name: DYNAMIC_FIELD,
        type: DataTypeStringEnum.JSON,
      });
    }

    const primaryKey = schemaList.find(v => v.isPrimaryKey === true)!;
    setPrimaryKey({ value: primaryKey['name'], type: primaryKey['fieldType'] });
    setConsistency_level(collection.consistency_level);

    setFields(nameList);
  };

  // Get fields at first or collection name changed.
  useEffect(() => {
    collectionName && getFields(collectionName);
  }, [collectionName]);

  const filterRef = useRef();

  const handleFilterReset = () => {
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    setExpression('');
    setTableLoading(null);
    setQueryResult(null);
    handleCurrentPage(0);
  };

  const handleFilterSubmit = (expression: string) => {
    setExpression(expression);
    handleQuery(expression);
  };

  const handleQuery = async (expr: string = '') => {
    setTableLoading(true);
    if (expr === '') {
      handleFilterReset();
      return;
    }
    try {
      const res = await Collection.queryData(collectionName, {
        expr: expr,
        output_fields: fields.map(i => i.name),
        offset: 0,
        limit: 16384,
        consistency_level: consistency_level,
        // travel_timestamp: timeTravelInfo.timestamp,
      });
      const result = res.data;
      setQueryResult(result);
      setLatency(res.latency);
    } catch (err) {
      setQueryResult([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSelectChange = (value: any) => {
    setSelectedData(value);
  };

  const handleDelete = async () => {
    await DataService.deleteEntities(collectionName, {
      expr: `${primaryKey.value} in [${selectedData
        .map(v =>
          primaryKey.type === DataTypeStringEnum.VarChar
            ? `"${v[primaryKey.value]}"`
            : v[primaryKey.value]
        )
        .join(',')}]`,
    });
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: collectionTrans('entities') }));
    handleQuery(expression);
  };

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
            placeholder={collectionTrans('exprPlaceHolder')}
            value={expression}
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
              setExpression(e.target.value as string);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // Do code here
                handleQuery(expression);
                e.preventDefault();
              }
            }}
          />
          <Filter
            ref={filterRef}
            title="Advanced Filter"
            fields={fields.filter(
              i =>
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
            value={consistency_level}
            label={collectionTrans('consistencyLevel')}
            wrapperClass={classes.selector}
            variant="filled"
            onChange={(e: { target: { value: unknown } }) => {
              const consistency = e.target.value as string;
              setConsistency_level(consistency);
            }}
          />
        </div>
        <div className="right">
          <CustomButton
            className="btn"
            onClick={handleFilterReset}
            disabled={!expression}
          >
            <ResetIcon classes={{ root: 'icon' }} />
            {btnTrans('reset')}
          </CustomButton>
          <CustomButton
            variant="contained"
            disabled={!expression}
            onClick={() => handleQuery(expression)}
          >
            {btnTrans('query')}
          </CustomButton>
        </div>
      </div>
      {tableLoading || queryResult?.length ? (
        <AttuGrid
          toolbarConfigs={[]}
          colDefinitions={fields.map(i => ({
            id: i.name,
            align: 'left',
            disablePadding: false,
            label:
              i.name === DYNAMIC_FIELD ? searchTrans('dynamicFields') : i.name,
          }))}
          primaryKey={primaryKey.value}
          openCheckBox={true}
          isLoading={!!tableLoading}
          rows={result}
          rowCount={total}
          selected={selectedData}
          setSelected={handleSelectChange}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          orderBy={orderBy}
          order={order}
          handleSort={handleGridSort}
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
          subText={collectionTrans('dataQuerylimits')}
        />
      )}
    </div>
  );
};

export default Query;
