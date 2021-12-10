import { FC, useEffect, useState, useRef, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { rootContext } from '../../context/Root';

import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import CustomButton from '../../components/customButton/CustomButton';
import AttuGrid from '../../components/grid/Grid';
import { ToolBarConfig } from '../../components/grid/Types';
import { getQueryStyles } from './Styles';
import Filter from '../../components/advancedSearch';
import { CollectionHttp } from '../../http/Collection';
import { FieldHttp } from '../../http/Field';
import { usePaginationHook } from '../../hooks/Pagination';
// import { useTimeTravelHook } from '../../hooks/TimeTravel';

import CopyButton from '../../components/advancedSearch/CopyButton';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import CustomToolBar from '../../components/grid/ToolBar';
// import { CustomDatePicker } from '../../components/customDatePicker/CustomDatePicker';
import { saveAs } from 'file-saver';
import { generateCsvData } from '../../utils/Format';
import { DataTypeStringEnum } from '../collections/Types';

const Query: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [expression, setExpression] = useState('');
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [selectedDatas, setSelectedDatas] = useState<any[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>('');

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;

  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy');

  const classes = getQueryStyles();

  // const { timeTravel, setTimeTravel, timeTravelInfo, handleDateTimeChange } =
  //   useTimeTravelHook();

  // Format result list
  const queryResultMemo = useMemo(
    () =>
      queryResult?.map((resultItem: { [key: string]: any }) => {
        // Iterate resultItem keys, then format vector(array) items.
        const tmp = Object.keys(resultItem).reduce(
          (prev: { [key: string]: any }, item: string) => {
            if (Array.isArray(resultItem[item])) {
              const list2Str = JSON.stringify(resultItem[item]);
              prev[item] = (
                <div className={classes.vectorTableCell}>
                  <div>{list2Str}</div>
                  <CopyButton
                    label={copyTrans.label}
                    value={list2Str}
                    className={classes.copyBtn}
                  />
                </div>
              );
            } else {
              prev[item] = `${resultItem[item]}`;
            }
            return prev;
          },
          {}
        );
        return tmp;
      }),
    [queryResult, classes.vectorTableCell, classes.copyBtn, copyTrans.label]
  );

  const csvDataMemo = useMemo(() => {
    const headers: string[] = fields?.map(i => i.name);
    if (headers?.length && queryResult?.length) {
      return generateCsvData(headers, queryResult);
    }
    return '';
  }, [fields, queryResult]);

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
    const schemaList = await FieldHttp.getFields(collectionName);
    const nameList = schemaList.map(v => ({
      name: v.name,
      type: v.data_type,
    }));
    const primaryKey =
      schemaList.find(v => v._isPrimaryKey === true)?._fieldName || '';
    setPrimaryKey(primaryKey);
    // Temporarily hide bool field due to incorrect return from SDK.
    const fieldWithoutBool = nameList.filter(
      i => i.type !== DataTypeStringEnum.Bool
    );
    setFields(fieldWithoutBool);
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
    setQueryResult(null);
  };

  const handleQuery = async () => {
    setTableLoading(true);
    try {
      const res = await CollectionHttp.queryData(collectionName, {
        expr: expression,
        output_fields: fields.map(i => i.name),
        // travel_timestamp: timeTravelInfo.timestamp,
      });
      const result = res.data;
      setQueryResult(result);
    } catch (err) {
      setQueryResult([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSelectChange = (value: any) => {
    setSelectedDatas(value);
  };

  const handleDelete = async () => {
    await CollectionHttp.deleteEntities(collectionName, {
      expr: `${primaryKey} in [${selectedDatas.map(v => v.id).join(',')}]`,
    });
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: collectionTrans('entites') }));
    handleQuery();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      type: 'iconBtn',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DeleteTemplate
                label={btnTrans('delete')}
                title={dialogTrans('deleteTitle', {
                  type: collectionTrans('entites'),
                })}
                text={collectionTrans('deleteDataWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: collectionTrans('delete'),
      icon: 'delete',
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteTooltip'),
      disabled: () => selectedDatas.length === 0,
    },
    {
      type: 'iconBtn',
      onClick: () => {
        const csvData = new Blob([csvDataMemo.toString()], {
          type: 'text/csv;charset=utf-8',
        });
        saveAs(csvData, 'query_result.csv');
      },
      label: collectionTrans('delete'),
      icon: 'download',
      tooltip: collectionTrans('download'),
      disabledTooltip: collectionTrans('downloadTooltip'),
      disabled: () => !queryResult?.length,
    },
  ];

  return (
    <div className={classes.root}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />
      <div className={classes.toolbar}>
        <div className="left">
          {/* <div className="expression"> */}
          <div>{`${expression || collectionTrans('exprPlaceHolder')}`}</div>
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

          {/* <CustomDatePicker
            label={timeTravelInfo.label}
            onChange={handleDateTimeChange}
            date={timeTravel}
            setDate={setTimeTravel}
          /> */}
        </div>
        <div className="right">
          <CustomButton className="btn" onClick={handleFilterReset}>
            <ResetIcon classes={{ root: 'icon' }} />
            {btnTrans('reset')}
          </CustomButton>
          <CustomButton
            variant="contained"
            disabled={!expression}
            onClick={() => handleQuery()}
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
            label: i.name,
          }))}
          primaryKey={fields.find(i => i.is_primary_key)?.name}
          openCheckBox={true}
          isLoading={!!tableLoading}
          rows={result}
          rowCount={total}
          selected={selectedDatas}
          setSelected={handleSelectChange}
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          orderBy={orderBy}
          order={order}
          handleSort={handleGridSort}
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
