import { FC, useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import CustomButton from '../../components/customButton/CustomButton';
import MilvusGrid from '../../components/grid/Grid';
import { getQueryStyles } from './Styles';
import Filter from '../../components/advancedSearch';
import { CollectionHttp } from '../../http/Collection';
import { FieldHttp } from '../../http/Field';
import { usePaginationHook } from '../../hooks/Pagination';

const Query: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [expression, setExpression] = useState('');
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();

  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;

  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const classes = getQueryStyles();

  // Format result list
  const queryResultMemo = useMemo(
    () =>
      queryResult?.map((resultItem: { [key: string]: any }) => {
        // Iterate resultItem keys, then format vector(array) items.
        const tmp = Object.keys(resultItem).reduce(
          (prev: { [key: string]: any }, item: string) => {
            if (Array.isArray(resultItem[item])) {
              const list2Str = `[${resultItem[item]}]`;
              prev[item] = (
                <div className={classes.vectorTableCell} title={list2Str}>
                  {list2Str}
                </div>
              );
            } else {
              prev[item] = resultItem[item];
            }
            return prev;
          },
          {}
        );
        return tmp;
      }),
    [queryResult, classes.vectorTableCell]
  );

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
    const nameList = schemaList.map(i => ({
      name: i.name,
      type: i.data_type.includes('Int') ? 'int' : 'float',
    }));
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
  };
  const handleFilterSubmit = (expression: string) => {
    setExpression(expression);
  };
  const handleQuery = async () => {
    setTableLoading(true);
    try {
      const res = await CollectionHttp.queryData(collectionName, {
        expr: expression,
        output_fields: fields.map(i => i.name),
      });
      setTableLoading(false);
      const result = res.data;
      setQueryResult(result);
    } catch (err) {
      setTableLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <div className="left">
          <div>{`${
            expression || 'Please enter your query or use advanced filter ->'
          }`}</div>
          <Filter
            ref={filterRef}
            title="Advanced Filter"
            fields={fields}
            filterDisabled={false}
            onSubmit={handleFilterSubmit}
            showTitle={false}
            showTooltip={false}
          />
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
      {tableLoading || queryResult ? (
        <MilvusGrid
          toolbarConfigs={[]}
          colDefinitions={fields.map(i => ({
            id: i.name,
            align: 'left',
            disablePadding: false,
            label: i.name,
          }))}
          primaryKey={fields.find(i => i.is_primary_key)?.name}
          openCheckBox={false}
          isLoading={!!tableLoading}
          rows={result}
          rowCount={total}
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
            queryResult !== null
              ? searchTrans('empty')
              : collectionTrans('startTip')
          }
        />
      )}
    </div>
  );
};

export default Query;
