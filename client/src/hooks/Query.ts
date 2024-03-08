import { useState, useRef, useEffect } from 'react';
import { DataTypeStringEnum, MIN_INT64 } from '@/consts';
import { CollectionService } from '@/http';
import { CollectionFullObject, FieldObject } from '@server/types';

export const useQuery = (params: {
  onQueryStart: Function;
  onQueryEnd?: Function;
  onQueryFinally?: Function;
  collectionName: string;
}) => {
  // state
  const [collection, setCollection] = useState<CollectionFullObject>();
  const [fields, setFields] = useState<FieldObject[]>([]);
  const [consistencyLevel, setConsistencyLevel] = useState<string>('Bounded');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [expr, setExpr] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>({ data: [], latency: 0 });
  const lastQuery = useRef<any>();

  // build local cache for pk ids
  const pageCache = useRef(new Map());

  // get next/previous expression
  const getPageExpr = (page: number) => {
    const cache = pageCache.current.get(
      page > currentPage ? currentPage : page
    );
    const primaryKey = collection?.schema?.primaryField;

    const formatPKValue = (pkId: string | number) =>
      primaryKey?.data_type === DataTypeStringEnum.VarChar ? `'${pkId}'` : pkId;

    // If cache does not exist, return expression based on primaryKey type
    let condition = '';
    if (!cache) {
      const defaultValue =
        primaryKey?.data_type === DataTypeStringEnum.VarChar
          ? "''"
          : `${MIN_INT64}`;
      condition = `${primaryKey?.name} > ${defaultValue}`;
    } else {
      const { firstPKId, lastPKId } = cache;
      const lastPKValue = formatPKValue(lastPKId);
      const firstPKValue = formatPKValue(firstPKId);

      condition =
        page > currentPage
          ? `(${primaryKey?.name} > ${lastPKValue})`
          : `((${primaryKey?.name} <= ${lastPKValue}) && (${primaryKey?.name} >= ${firstPKValue}))`;
    }

    return expr ? `${expr} && ${condition}` : condition;
  };

  // query function
  const query = async (
    page: number = currentPage,
    consistency_level = consistencyLevel
  ) => {
    const _expr = getPageExpr(page);
    // console.log('query expr', _expr);
    params.onQueryStart(_expr);

    try {
      const queryParams = {
        expr: _expr,
        output_fields: fields.map(i => i.name),
        limit: pageSize || 10,
        consistency_level,
        // travel_timestamp: timeTravelInfo.timestamp,
      };

      // cache last query
      lastQuery.current = queryParams;
      // execute query
      const res = await CollectionService.queryData(
        params.collectionName,
        queryParams
      );

      // get last item of the data
      const lastItem = res.data[res.data.length - 1];
      // get first item of the data
      const firstItem = res.data[0];
      // get last pk id
      const lastPKId: string | number =
        lastItem && lastItem[collection!.schema.primaryField.name];
      // get first pk id
      const firstPKId: string | number =
        firstItem && firstItem[collection!.schema.primaryField.name];

      // store pk id in the cache with the page number
      if (lastItem) {
        pageCache.current.set(page, {
          firstPKId,
          lastPKId,
        });
      }

      // console.log('query result page', page, pageCache.current);

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
    const collection = await CollectionService.getCollection(
      collectionName
    );
    setFields([
      ...collection.schema.fields,
      ...collection.schema.dynamicFields,
    ]);
    setConsistencyLevel(collection.consistency_level);
    setCollection(collection);
  };

  const count = async (consistency_level = consistencyLevel) => {
    const count = 'count(*)';
    const res = await CollectionService.queryData(params.collectionName, {
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
    setQueryResult({ data: [], latency: 0 });
    pageCache.current.clear();
  };

  // Get fields at first or collection name changed.
  useEffect(() => {
    // reset
    reset();
    // get collection info
    params.collectionName && prepare(params.collectionName);
  }, [params.collectionName]);

  // query if expr is changed
  useEffect(() => {
    if (!collection || !collection.loaded) {
      // console.info('[skip running query]: no key yet');
      return;
    } // reset
    reset();
    // get count;
    count();
    // do the query
    query();
  }, [expr, pageSize]);

  // query if collection is changed
  useEffect(() => {
    if (!collection || !collection.loaded) {
      // console.info('[skip running query]: no key yet');
      return;
    }

    // get count;
    count();
    // do the query
    query();
  }, [collection]);

  return {
    // collection info(primaryKey, consistency level, fields)
    collection,
    // fields,
    fields,
    // total query count
    total,
    // page size
    pageSize,
    // update page size
    setPageSize,
    // consistency level
    consistencyLevel,
    // update consistency level
    setConsistencyLevel,
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
    // get expression
    getPageExpr,
  };
};
