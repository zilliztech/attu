import { FC, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AttuGrid from '../../components/grid/Grid';
import { getQueryStyles } from '../query/Styles';
import { CollectionHttp } from '../../http/Collection';
import { FieldHttp } from '../../http/Field';
import { IndexHttp } from '../../http/Index';
import { usePaginationHook } from '../../hooks/Pagination';
import CopyButton from '../../components/advancedSearch/CopyButton';
import { ToolBarConfig } from '../../components/grid/Types';
import CustomToolBar from '../../components/grid/ToolBar';
import { DataTypeStringEnum } from '../collections/Types';
import { generateVector } from '../../utils/Common';

import {
  FLOAT_INDEX_CONFIG,
  BINARY_INDEX_CONFIG,
  DEFAULT_SEARCH_PARAM_VALUE_MAP,
} from '../../consts/Milvus';

const Preview: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const { t: commonTrans } = useTranslation();
  const { t: collectionTrans } = useTranslation('collection');

  const copyTrans = commonTrans('copy');

  const classes = getQueryStyles();
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

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
  } = usePaginationHook(queryResultMemo || []);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  const loadData = async (collectionName: string) => {
    // get schema list
    const schemaList = await FieldHttp.getFields(collectionName);
    const nameList = schemaList.map(v => ({
      name: v.name,
      type: v.data_type,
    }));

    const id = schemaList.find(v => v._isPrimaryKey === true);
    const primaryKey = id?._fieldName || '';
    const delimiter = id?.data_type === 'Int64' ? '' : '"';

    const vectorField = schemaList.find(
      v => v.data_type === 'FloatVector' || v.data_type === 'BinaryVector'
    );

    const anns_field = vectorField?._fieldName!;
    const dim = Number(vectorField?._dimension);
    const vectors = [generateVector(dim)];
    // get search params
    const indexesInfo = await IndexHttp.getIndexInfo(collectionName);
    const indexConfig =
      BINARY_INDEX_CONFIG[indexesInfo[0]._indexType] ||
      FLOAT_INDEX_CONFIG[indexesInfo[0]._indexType];
    const metric_type = indexesInfo[0]._metricType;
    const searchParamKey = indexConfig.search[0];
    const searchParamValue = DEFAULT_SEARCH_PARAM_VALUE_MAP[searchParamKey];
    const searchParam = { [searchParamKey]: searchParamValue };
    const params = `${JSON.stringify(searchParam)}`;
    setPrimaryKey(primaryKey);
    // Temporarily hide bool field due to incorrect return from SDK.
    const fieldWithoutBool = nameList.filter(
      i => i.type !== DataTypeStringEnum.Bool
    );

    // set fields
    setFields(fieldWithoutBool);

    // set loading
    setTableLoading(true);

    try {
      // first, search random data to get random id
      const searchRes = await CollectionHttp.vectorSearchData(collectionName, {
        search_params: {
          topk: 100,
          anns_field,
          metric_type,
          params,
        },
        expr: '',
        vectors,
        output_fields: [primaryKey],
        vector_type: Number(vectorField?._fieldId),
      });

      // compose random id list expression
      const expr = `${primaryKey} in [${searchRes.results
        .map((d: any) => `${delimiter}${d.id}${delimiter}`)
        .join(',')}]`;

      // query by random id
      const res = await CollectionHttp.queryData(collectionName, {
        expr: expr,
        output_fields: fieldWithoutBool.map(i => i.name),
      });

      const result = res.data;
      setQueryResult(result);
    } catch (err) {
      setQueryResult([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Get fields at first or collection name changed.
  useEffect(() => {
    collectionName && loadData(collectionName);
  }, [collectionName]);

  const toolbarConfigs: ToolBarConfig[] = [
    {
      type: 'iconBtn',
      onClick: () => {
        loadData(collectionName);
      },
      label: collectionTrans('refresh'),
      icon: 'refresh',
    },
  ];

  return (
    <div className={classes.root}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />

      <AttuGrid
        toolbarConfigs={[]}
        colDefinitions={fields.map(i => ({
          id: i.name,
          align: 'left',
          disablePadding: false,
          label: i.name,
        }))}
        primaryKey={primaryKey}
        openCheckBox={false}
        isLoading={!!tableLoading}
        rows={result}
        rowCount={total}
        page={currentPage}
        onChangePage={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
      />
    </div>
  );
};

export default Preview;
