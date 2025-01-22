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
  const query = async (
    page: number = currentPage,
    consistency_level = queryState.consistencyLevel,
    _outputFields = queryState.outputFields,
    expr = queryState.expr
  ) => {
    if (!collection || !collection.loaded) return;
    const _expr = getPageExpr(page, expr);

    onQueryStart(_expr);

    try {
      const queryParams = {
        expr: _expr,
        output_fields: _outputFields,
        limit: pageSize || 10,
        consistency_level,
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
      reset();
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
    const res = await CollectionService.queryData(collection.collection_name, {
      expr: expr,
      output_fields: [count],
      consistency_level,
    });
    setTotal(Number(res.data[0][count]));
  };

  // reset
  const reset = () => {
    setCurrentPage(0);
    setQueryResult({ data: [], latency: 0 });

    pageCache.current.clear();
  };

  // query if expr is changed
  useEffect(() => {
    if (!collection || !collection.loaded || !pageSize) {
      setQueryResult({ data: [], latency: 0 });
      setTotal(collection.rowCount);
      // console.info('[skip running query]: no key yet');
      return;
    } // reset
    reset();
    // get count;
    count(queryState.expr);

    // do the query
    query(
      currentPage,
      queryState.consistencyLevel,
      queryState.outputFields,
      queryState.expr
    );
  }, [
    pageSize,
    JSON.stringify([
      queryState.outputFields,
      queryState.collection,
      queryState.consistencyLevel,
      queryState.expr,
      queryState.tick,
    ]),
  ]);

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
