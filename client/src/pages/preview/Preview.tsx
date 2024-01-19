import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AttuGrid from '@/components/grid/Grid';
import { Collection, MilvusIndex } from '@/http';
import { usePaginationHook, useSearchResult } from '@/hooks';
import { generateVector } from '@/utils';
import {
  INDEX_CONFIG,
  DEFAULT_SEARCH_PARAM_VALUE_MAP,
  DYNAMIC_FIELD,
  DataTypeEnum,
  DataTypeStringEnum,
} from '@/consts';
import { ToolBarConfig } from '@/components/grid/Types';
import CustomToolBar from '@/components/grid/ToolBar';
import { getQueryStyles } from '../query/Styles';

const Preview: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<any>();
  const [queryResult, setQueryResult] = useState<any>();
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');

  const classes = getQueryStyles();

  // Format result list
  const queryResultMemo = useSearchResult(queryResult);

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
    const collection = await Collection.getCollectionInfo(collectionName);

    const schemaList = collection.fields!;
    let nameList = schemaList.map(v => ({
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

    const id = schemaList.find(v => v.isPrimaryKey === true);
    const primaryKey = id?.name || '';
    const delimiter = id?.fieldType === 'Int64' ? '' : '"';

    const vectorField = schemaList.find(
      v => v.fieldType === 'FloatVector' || v.fieldType === 'BinaryVector'
    );
    const anns_field = vectorField?.name!;
    const dim = Number(vectorField?.dimension);
    const vectors = [
      generateVector(vectorField?.fieldType === 'FloatVector' ? dim : dim / 8),
    ];
    // get search params
    const indexesInfo = await MilvusIndex.getIndexInfo(collectionName);
    const vectorIndex = indexesInfo.filter(i => i.field_name === anns_field)[0];

    const indexType = indexesInfo.length == 0 ? 'FLAT' : vectorIndex.indexType;
    const indexConfig = INDEX_CONFIG[indexType];
    const metric_type =
      indexesInfo.length === 0 ? 'L2' : vectorIndex.metricType;
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
      const searchRes = await Collection.vectorSearchData(collectionName, {
        search_params: {
          topk: 100,
          anns_field,
          metric_type,
          params,
        },
        expr: '',
        vectors,
        output_fields: [primaryKey],
        vector_type:
          DataTypeEnum[vectorField!.fieldType as keyof typeof DataTypeEnum],
      });

      // compose random id list expression
      const expr = `${primaryKey} in [${searchRes.results
        .map((d: any) => `${delimiter}${d.id}${delimiter}`)
        .join(',')}]`;

      // query by random id
      const res = await Collection.queryData(collectionName, {
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
      icon: 'refresh',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        loadData(collectionName);
      },
      label: btnTrans('refresh'),
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
          needCopy: true,
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
