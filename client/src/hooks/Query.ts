import { useState, useRef, useEffect } from 'react';
import { DataTypeStringEnum, MIN_INT64 } from '@/consts';
import { CollectionService } from '@/http';
import type { CollectionFullObject } from '@server/types';
import { QueryState } from '@/pages/databases/types';

// TODO: refactor this, a little bit messy
export const useQuery = (params: {
  collection: CollectionFullObject;
  onQueryStart: Function;
  onQueryEnd?: Function;
  onQueryFinally?: Function;
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
}) => {
  // params
  const { collection, onQueryStart, onQueryEnd, onQueryFinally, queryState } =
    params;

  // states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [queryResult, setQueryResult] = useState<any>({ data: [], latency: 0 });

  // build local cache for pk ids
  const pageCache = useRef(new Map());

  // get next/previous expression
  const getPageExpr = (page: number, expr = queryState.expr) => {
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
  const query = async (page: number = currentPage, queryState: QueryState) => {
    if (!collection || !collection.loaded) return;
    const _expr = getPageExpr(page, queryState.expr);

    onQueryStart(_expr);

    // each queryState.outputFields can not be a function output
    const outputFields = queryState.outputFields.filter(
      f =>
        !collection.schema.fields.find(ff => ff.name === f)?.is_function_output
    );

    try {
      const queryParams = {
        expr: _expr,
        output_fields: outputFields,
        limit: pageSize || 10,
        consistency_level: queryState.consistencyLevel,
        // travel_timestamp: timeTravelInfo.timestamp,
      };

      // execute query
      const res = await CollectionService.queryData(
        collection.collection_name,
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

      onQueryEnd?.(res);
    } catch (e: any) {
      reset(true);
    } finally {
      onQueryFinally?.();
    }
  };

  const count = async (
    consistency_level = queryState.consistencyLevel,
    expr = queryState.expr
  ) => {
    if (!collection || !collection.loaded) {
      setTotal(collection.rowCount);
      return;
    }
    const count = 'count(*)';
    try {
      const res = await CollectionService.queryData(
        collection.collection_name,
        {
          expr: expr,
          output_fields: [count],
          consistency_level,
        }
      );
      setTotal(Number(res.data[0][count]));
    } catch (error) {
      setTotal(0);
    }
  };

  // reset
  const reset = (clearData = false) => {
    setCurrentPage(0);
    if (clearData) {
      setQueryResult({ data: [], latency: 0 });
    }

    pageCache.current.clear();
  };

  // query if expression or other dependencies change
  useEffect(() => {
    // Skip query execution if prerequisites are not met
    if (!collection || !collection.loaded || !pageSize) {
      // Reset result and use collection row count as total when not ready to query
      setQueryResult({ data: [], latency: 0 });
      setTotal(collection.rowCount);
      return;
    }

    // When all prerequisites are met, perform query
    reset();

    // First get total count
    count(queryState.consistencyLevel, queryState.expr);

    // Then fetch actual data
    query(currentPage, queryState);
  }, [
    pageSize,
    queryState.outputFields,
    queryState.collection,
    queryState.consistencyLevel,
    queryState.expr,
    queryState.tick,
  ]);

  // Reset state when collection changes
  useEffect(() => {
    // Immediately reset when collection changes to avoid showing stale data
    setQueryResult({ data: [], latency: 0 });
    setCurrentPage(0);
    pageCache.current.clear();

    // Set total to collection row count as fallback
    if (collection) {
      setTotal(collection.rowCount || 0);
    }
  }, [collection.collection_name]);

  return {
    // total query count
    total,
    // page size
    pageSize,
    // update page size
    setPageSize,
    // current page
    currentPage,
    // query current data page
    setCurrentPage,
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
