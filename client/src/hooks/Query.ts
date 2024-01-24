import { useState, useRef, useEffect } from 'react';
import { DataTypeStringEnum, DYNAMIC_FIELD } from '@/consts';
import { Collection } from '@/http';

export const useQuery = (params: {
  onQueryStart: Function;
  onQueryEnd?: Function;
  onQueryFinally?: Function;
  collectionName: string;
}) => {
  // state
  const [collection, setCollection] = useState<any>({
    fields: [],
    consistencyLevel: '',
    primaryKey: { value: '', type: DataTypeStringEnum.Int64 },
  });
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [expr, setExpr] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>({ data: [], latency: 0 });

  // build local cache for pk ids
  const pageCache = useRef(new Map());

  // get next/previous expression
  const getPageExpr = (page: number) => {
    const cache = pageCache.current.get(
      page > currentPage ? currentPage : page
    );
    const primaryKey = collection.primaryKey;

    const formatPKValue = (pkId: string | number) =>
      primaryKey.type === DataTypeStringEnum.VarChar ? `'${pkId}'` : pkId;

    // If cache does not exist, return expression based on primaryKey type
    let condition = '';
    if (!cache) {
      const defaultValue =
        primaryKey.type === DataTypeStringEnum.VarChar ? "''" : '0';
      condition = `${primaryKey.value} > ${defaultValue}`;
    } else {
      const { firstPKId, lastPKId } = cache;
      const lastPKValue = formatPKValue(lastPKId);
      const firstPKValue = formatPKValue(firstPKId);

      condition =
        page > currentPage
          ? `(${primaryKey.value} > ${lastPKValue})`
          : `((${primaryKey.value} <= ${lastPKValue}) && (${primaryKey.value} >= ${firstPKValue}))`;
    }

    return expr ? `${expr} && ${condition}` : condition;
  };

  // query function
  const query = async (
    page: number = currentPage,
    consistency_level = collection.consistencyLevel
  ) => {
    if (!collection.primaryKey.value) {
      //   console.info('[skip running query]: no key yet');
      return;
    }
    const _expr = getPageExpr(page);
    //   console.log('query expr', _expr);
    params.onQueryStart(_expr);

    try {
      // execute query
      const res = await Collection.queryData(params.collectionName, {
        expr: _expr,
        output_fields: collection.fields.map((i: any) => i.name),
        limit: pageSize || 10,
        consistency_level,
        // travel_timestamp: timeTravelInfo.timestamp,
      });

      // get last item of the data
      const lastItem = res.data[res.data.length - 1];
      // get first item of the data
      const firstItem = res.data[0];
      // get last pk id
      const lastPKId: string | number =
        lastItem && lastItem[collection.primaryKey.value];
      // get first pk id
      const firstPKId: string | number =
        firstItem && firstItem[collection.primaryKey.value];

      // store pk id in the cache with the page number
      pageCache.current.set(page, {
        firstPKId,
        lastPKId,
      });

      //   console.log('query result page', page, pageCache.current);

      // update query result
      setQueryResult(res);

      params.onQueryEnd?.(res);
    } catch (e: any) {
      reset();
    } finally {
      params.onQueryFinally?.();
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

  const count = async (consistency_level = collection.consistency_level) => {
    if (!collection.primaryKey.value) {
      //   console.info('[skip running count]: no key yet', expr);
      return;
    }
    const count = 'count(*)';
    const res = await Collection.queryData(params.collectionName, {
      expr: expr,
      output_fields: [count],
      consistency_level,
      // travel_timestamp: timeTravelInfo.timestamp,
    });
    setTotal(Number(res.data[0][count]));
  };

  // reset
  const reset = () => {
    setCurrentPage(0);
    setQueryResult({ data: [] });
    pageCache.current.clear();
  };

  // Get fields at first or collection name changed.
  useEffect(() => {
    params.collectionName && prepare(params.collectionName);
  }, [params.collectionName]);

  // query if expr is changed
  useEffect(() => {
    // reset
    reset();
    // get count;
    count();
    // do the query
    query();
  }, [expr]);

  // query if collection is changed
  useEffect(() => {
    // reset
    reset();
    // get count;
    count();
    // do the query
    query();
  }, [collection]);

  return {
    // collection info(primaryKey, consistency level, fields)
    collection,
    // total query count
    total,
    // page size
    pageSize,
    // update page size
    setPageSize,
    // update consistency level
    setConsistencyLevel: (level: string) => {
      setCollection({ ...collection, consistencyLevel: level });
    },
    // current page
    currentPage,
    // query current data page
    setCurrentPage,
    // expression to query
    expr,
    // expression updater
    setExpr,
    // query result
    queryResult,
    // query
    query,
    // reset
    reset,
    // count
    count,
  };
};