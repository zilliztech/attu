import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AttuGrid from '@/components/grid/Grid';
import { CollectionHttp, IndexHttp } from '@/http';
import { usePaginationHook, useSearchResult } from '@/hooks';
import { generateVector } from '@/utils';
import {
  INDEX_CONFIG,
  DEFAULT_SEARCH_PARAM_VALUE_MAP,
  DYNAMIC_FIELD,
} from '@/consts';
import { ToolBarConfig } from '@/components/grid/Types';
import CustomToolBar from '@/components/grid/ToolBar';
import { DataTypeEnum, DataTypeStringEnum } from '@/pages/collections/Types';
import { getQueryStyles } from '../query/Styles';

const Preview: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: searchTrans } = useTranslation('search');

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
  } = usePaginationHook(queryResultMemo || []);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  const loadData = async (collectionName: string) => {
    // get schema list
    const collection = await CollectionHttp.getCollection(collectionName);

    const schemaList = collection._fields!;
    let nameList = schemaList.map(v => ({
      name: v.name,
      type: v.data_type,
    }));

    // if the dynamic field is enabled, we add $meta column in the grid
    if (collection._enableDynamicField) {
      nameList.push({
        name: DYNAMIC_FIELD,
        type: DataTypeStringEnum.JSON,
      });
    }

    const id = schemaList.find(v => v._isPrimaryKey === true);
    const primaryKey = id?._fieldName || '';
    const delimiter = id?.data_type === 'Int64' ? '' : '"';

    const vectorField = schemaList.find(
      v => v.data_type === 'FloatVector' || v.data_type === 'BinaryVector'
    );
    const anns_field = vectorField?._fieldName!;
    const dim = Number(vectorField?._dimension);
    const vectors = [
      generateVector(vectorField?.data_type === 'FloatVector' ? dim : dim / 8),
    ];
    // get search params
    const indexesInfo = await IndexHttp.getIndexInfo(collectionName);
    const vectorIndex = indexesInfo.filter(i => i._fieldName === anns_field)[0];

    const indexType = indexesInfo.length == 0 ? 'FLAT' : vectorIndex._indexType;
    const indexConfig = INDEX_CONFIG[indexType];
    const metric_type =
      indexesInfo.length === 0 ? 'L2' : vectorIndex._metricType;
    const searchParamKey = indexConfig.search[0];
    const searchParamValue = DEFAULT_SEARCH_PARAM_VALUE_MAP[searchParamKey];
    const searchParam = { [searchParamKey]: searchParamValue };
    const params = `${JSON.stringify(searchParam)}`;
    setPrimaryKey(primaryKey);

    // set fields
    setFields(nameList);

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
        vector_type: DataTypeEnum[vectorField!._fieldType],
      });

      // compose random id list expression
      const expr = `${primaryKey} in [${searchRes.results
        .map((d: any) => `${delimiter}${d.id}${delimiter}`)
        .join(',')}]`;

      // query by random id
      const res = await CollectionHttp.queryData(collectionName, {
        expr: expr,
        output_fields: [...nameList.map(i => i.name)],
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
          label:
            i.name === DYNAMIC_FIELD ? searchTrans('dynamicFields') : i.name,
        }))}
        primaryKey={primaryKey}
        openCheckBox={false}
        isLoading={!!tableLoading}
        rows={result}
        rowCount={total}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
      />
    </div>
  );
};

export default Preview;
