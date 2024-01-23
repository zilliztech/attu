import { useState, useRef, useEffect } from 'react';
import { DataTypeStringEnum, DYNAMIC_FIELD } from '@/consts';
import { Collection, DataService } from '@/http';

export const useQuery = (params: {
  expr: string;
  data: any[];
  onQueryStart: Function;
  onQueryEnd: Function;
  onQueryFinally: Function;
  collectionName: string;
}) => {
  const [collection, setCollection] = useState<any>({
    fields: [],
    consistencyLevel: '',
    primaryKey: { value: '', type: DataTypeStringEnum.Int64 },
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(1);
  const [expr, setExpr] = useState<string>(params.expr);

  // build local cache for pk ids
  const localCache = useRef(new Map());
  // get last item of the data
  const lastItem = params.data[params.data.length - 1];
  // get first item of the data
  const firstItem = params.data[0];
  // get last pk id
  const lastPKId: string | number =
    lastItem && lastItem[collection.primaryKey.value];
  // get first pk id
  const firstPKId: string | number =
    firstItem && firstItem[collection.primaryKey.value];
  // store pk id in the cache with the page number
  localCache.current.set(currentPage, {
    firstPKId,
    lastPKId,
  });

  // get next/previous expression
  const getExpr = (page: number) => {
    const primaryKey = collection.primaryKey;
    const lastPKValue =
      primaryKey.type === DataTypeStringEnum.VarChar
        ? `'${lastPKId}'`
        : lastPKId;

    const firstPKValue =
      primaryKey.type === DataTypeStringEnum.VarChar
        ? `'${firstPKId}'`
        : firstPKId;

    const lastPage = localCache.current.get(page);

    return page > currentPage
      ? expr
        ? `${expr} && (${primaryKey.value} > ${lastPKValue})`
        : `(${primaryKey.value} > ${lastPKValue})`
      : expr
      ? `${expr} && ((${primaryKey.value} < ${firstPKValue}) && (${primaryKey.value} >= ${lastPage.firstPKId}) )`
      : `((${primaryKey.value} < ${firstPKValue}) && (${primaryKey.value} >= ${lastPage.firstPKId}) )`;
  };

  // query function
  const query = async (_expr: string = '') => {
    params.onQueryStart(_expr);

    try {
      const res = await Collection.queryData(params.collectionName, {
        expr: _expr,
        output_fields: collection.fields.map((i: any) => i.name),
        limit: pageSize,
        consistency_level: collection.consistencyLevel,
        // travel_timestamp: timeTravelInfo.timestamp,
      });
      params.onQueryEnd(res);
    } catch (err) {
      params.onQueryEnd([]);
    } finally {
      params.onQueryFinally();
    }
  };

  // get collection info
  const prepare = async (collectionName: string) => {
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

    setCollection({
      fields: nameList as any[],
      consistencyLevel: collection.consistency_level,
      primaryKey: { value: primaryKey['name'], type: primaryKey['fieldType'] },
    });
  };

  // Get fields at first or collection name changed.
  useEffect(() => {
    params.collectionName && prepare(params.collectionName);
  }, [params.collectionName]);

  // clear cache
  useEffect(() => {
    if (expr == '') {
      localCache.current.clear();
      setCurrentPage(0);
    }
  }, [expr]);

  return {
    total: 1000,
    pageSize,
    setPageSize,
    collection,
    setConsistencyLevel: (level: string) => {
      setCollection({ ...collection, consistencyLevel: level });
    },
    currentPage,
    expr,
    setExpr,
    setCurrentPage,
    getExpr,
    query,
  };
};
