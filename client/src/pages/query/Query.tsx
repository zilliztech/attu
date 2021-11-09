import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';

import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import CustomButton from '../../components/customButton/CustomButton';
import MilvusGrid from '../../components/grid/Grid';
import { getQueryStyles } from './Styles';
import CustomToolBar from '../../components/grid/ToolBar';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
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
  } = usePaginationHook(queryResult || []);
  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  const getFields = async (collectionName: string) => {
    const schemaList = await FieldHttp.getFields(collectionName);
    const nameList = schemaList.map(i => ({
      name: i.name,
      type: i.data_type.includes('Int') ? 'int' : 'float',
    }));
    console.log(schemaList);
    setFields(nameList);
  };

  useEffect(() => {
    collectionName && getFields(collectionName);
  }, [collectionName]);

  const filterRef = useRef();
  const resetFilter = () => {
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
      console.log(res);
      const result = res.data;
      // const result = transferSearchResult(res.results);
      setQueryResult(result);
    } catch (err) {
      setTableLoading(false);
    }
  };

  return (
    <>
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
          <CustomButton className="btn" onClick={resetFilter}>
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
          // rows={queryResult || []}
          // rowCount={queryResult?.length || 0}
          primaryKey={fields.find(i => i.is_primary_key)?.name}
          // page={1}
          // onChangePage={() => {}}
          // rowsPerPage={1000}
          // setRowsPerPage={() => {}}
          openCheckBox={false}
          // isLoading={tableLoading}
          isLoading={!!tableLoading}
          // orderBy={fields.find(i => i.is_primary_key)?.name}
          // order={''}
          // handleSort={() => {}}
          rows={result}
          rowCount={total}
          // primaryKey="rank"
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          // openCheckBox={false}
          // isLoading={tableLoading}
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
    </>
  );
};

export default Query;
