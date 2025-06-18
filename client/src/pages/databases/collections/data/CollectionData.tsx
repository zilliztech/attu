import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { dataContext } from '@/context';
import { useQuery } from '@/hooks';
import icons from '@/components/icons/Icons';
import AttuGrid from '@/components/grid/Grid';
import CustomToolBar from '@/components/grid/ToolBar';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { Root } from '../../StyledComponents';
import { DYNAMIC_FIELD, ConsistencyLevelEnum } from '@/consts';
import { Typography } from '@mui/material';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import CollectionColHeader from '../CollectionColHeader';
import DataView from '@/components/DataView/DataView';
import type { QueryState } from '../../types';
import { CollectionFullObject } from '@server/types';
import CollectionToolbar from './DataActionToolbar';
import QueryToolbar from './QueryToolbar';

export interface CollectionDataProps {
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
}

const CollectionData = (props: CollectionDataProps) => {
  // props
  const { queryState, setQueryState } = props;
  const collection = queryState && queryState.collection;

  // collection is not found or collection full object is not ready
  if (!collection || !collection.consistency_level) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const exprInputRef = useRef<string>(queryState.expr);
  const [, forceUpdate] = useState({});
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI functions
  const { fetchCollection } = useContext(dataContext);
  // translations
  const { t: searchTrans } = useTranslation('search');
  const { t: commonTrans } = useTranslation();

  // UI ref
  const filterRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  // Query hook
  const {
    currentPage,
    total,
    pageSize,
    queryResult,
    setPageSize,
    setCurrentPage,
    query,
    reset,
    count,
  } = useQuery({
    collection,
    onQueryStart: (expr: string = '') => {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a timeout to show loading after 100ms
      loadingTimeoutRef.current = setTimeout(() => {
        setTableLoading(true);
      }, 100);

      if (expr === '') {
        handleFilterReset();
        return;
      }
    },
    onQueryFinally: () => {
      // Clear the timeout if it exists
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setTableLoading(false);
    },
    queryState: queryState,
    setQueryState: setQueryState,
  });

  // Memoized handlers
  const handleExprChange = useCallback(
    (value: string) => {
      exprInputRef.current = value;
      if (value === '' || value === queryState.expr) {
        forceUpdate({});
      }
    },
    [queryState.expr]
  );

  const handleExprKeyDown = useCallback(
    (e: any) => {
      if (e.key === 'Enter') {
        setQueryState({
          ...queryState,
          expr: exprInputRef.current,
          tick: queryState.tick + 1,
        });
        // reset page
        setCurrentPage(0);
        e.preventDefault();
      }
    },
    [queryState, setQueryState, setCurrentPage]
  );

  const handleFilterSubmit = useCallback(
    async (expression: string) => {
      // update UI expression
      setQueryState({ ...queryState, expr: expression });
      exprInputRef.current = expression;
      forceUpdate({});
    },
    [queryState, setQueryState]
  );

  // UI event handlers
  const handleFilterReset = useCallback(async () => {
    // reset advanced filter
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    // update UI expression
    exprInputRef.current = '';
    setQueryState({
      ...queryState,
      expr: '',
      outputFields: [...collection.schema.fields]
        .filter(f => !f.is_function_output)
        .map(f => f.name),
      tick: queryState.tick + 1,
    });
    forceUpdate({});

    // ensure not loading
    setTableLoading(false);
  }, [collection.schema.fields, queryState, setQueryState]);

  const handlePageChange = useCallback(
    async (e: any, page: number) => {
      // do the query
      await query(page, queryState.consistencyLevel);
      // update page number
      setCurrentPage(page);
    },
    [query, queryState.consistencyLevel, setCurrentPage]
  );

  const onSelectChange = useCallback((value: any) => {
    setSelectedData(value);
  }, []);

  const onDelete = useCallback(async () => {
    // clear selection
    setSelectedData([]);
    // reset();
    reset();
    // update count
    count(ConsistencyLevelEnum.Strong);
    // update query
    query(0, ConsistencyLevelEnum.Strong);
  }, [count, query, reset]);

  const onInsert = useCallback(
    async (collectionName: string) => {
      await fetchCollection(collectionName);
    },
    [fetchCollection]
  );

  const getEditData = useCallback(
    (data: any, collection: CollectionFullObject) => {
      // sort data by collection schema order
      const schema = collection.schema;
      let sortedData: { [key: string]: any } = {};
      schema.fields.forEach(field => {
        if (data[field.name] !== undefined) {
          sortedData[field.name] = data[field.name];
        }
      });

      // add dynamic fields if exist
      const isDynamicSchema = collection.schema.dynamicFields.length > 0;
      if (isDynamicSchema) {
        sortedData = { ...sortedData, ...data[DYNAMIC_FIELD] };
      }

      return sortedData;
    },
    []
  );

  // Get toolbar configs directly from CollectionToolbar component
  const toolbarConfigs = CollectionToolbar({
    collection,
    selectedData,
    total,
    queryState,
    setQueryState,
    onDelete,
    onInsert,
    getEditData,
    setSelectedData,
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // reset selection
    setSelectedData([]);
    exprInputRef.current = queryState.expr;
    forceUpdate({});

    // Clean up timeout on unmount or when collection changes
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [collection.collection_name, queryState.expr]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Root>
      {collection && (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} hideOnDisable={true} />
          <QueryToolbar
            collection={collection}
            queryState={queryState}
            setQueryState={setQueryState}
            exprInputRef={exprInputRef}
            handleExprChange={handleExprChange}
            handleExprKeyDown={handleExprKeyDown}
            handleFilterSubmit={handleFilterSubmit}
            handleFilterReset={handleFilterReset}
            setCurrentPage={setCurrentPage}
          />
          <AttuGrid
            toolbarConfigs={[]}
            colDefinitions={queryState.outputFields.map(i => {
              return {
                id: i,
                align: 'left',
                disablePadding: false,
                needCopy: true,
                formatter(_: any, cellData: any) {
                  const field = collection.schema.fields.find(
                    f => f.name === i
                  );

                  const fieldType = field?.data_type || 'JSON'; // dynamic

                  return <DataView type={fieldType} value={cellData} />;
                },
                headerFormatter: v => {
                  return (
                    <CollectionColHeader def={v} collection={collection} />
                  );
                },
                label: i === DYNAMIC_FIELD ? searchTrans('dynamicFields') : i,
              };
            })}
            primaryKey={collection.schema.primaryField.name}
            openCheckBox={true}
            isLoading={tableLoading}
            rows={queryResult.data}
            rowCount={total}
            selected={selectedData}
            tableHeaderHeight={43.5}
            rowHeight={43}
            setSelected={onSelectChange}
            page={currentPage}
            onPageChange={handlePageChange}
            setRowsPerPage={setPageSize}
            rowsPerPage={pageSize}
            showPagination={!tableLoading && collection.loaded}
            labelDisplayedRows={getLabelDisplayedRows(
              commonTrans(
                queryResult.data.length > 1 ? 'grid.entities' : 'grid.entity'
              ),
              <>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.75rem',
                    lineHeight: 1,
                  }}
                >
                  ({queryResult.latency || ''} ms)
                </Typography>
                {currentPage * pageSize + pageSize < total &&
                queryResult.data.length < pageSize ? (
                  <Typography
                    component="span"
                    sx={{
                      color: 'warning.main',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                      marginLeft: '4px',
                    }}
                  >
                    <icons.info
                      sx={{
                        fontSize: '12px',
                        color: 'warning.main',
                        marginTop: '1px',
                      }}
                    />
                    {searchTrans('duplicateDataWarning')}
                  </Typography>
                ) : null}
              </>
            )}
            noData={searchTrans(
              `${collection.loaded ? 'empty' : 'collectionNotLoaded'}`
            )}
          />
        </>
      )}
    </Root>
  );
};

export default CollectionData;
