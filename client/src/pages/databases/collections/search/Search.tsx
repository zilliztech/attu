import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DataService } from '@/http';
import Icons from '@/components/icons/Icons';
import AttuGrid from '@/components/grid/Grid';
import Filter from '@/components/advancedSearch';
import EmptyCard from '@/components/cards/EmptyCard';
import CustomButton from '@/components/customButton/CustomButton';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { useSearchResult, usePaginationHook } from '@/hooks';
import { getQueryStyles } from './Styles';
import SearchGlobalParams from './SearchGlobalParams';
import VectorInputBox from './VectorInputBox';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CustomInput from '@/components/customInput/CustomInput';
import {
  formatFieldType,
  VectorStrToObject,
  cloneObj,
  generateVectorsByField,
  saveCsvAs,
} from '@/utils';
import SearchParams from '../../../search/SearchParams';
import {
  SearchParams as SearchParamsType,
  SearchSingleParams,
  SearchResultView,
} from '../../types';
import { DYNAMIC_FIELD } from '@/consts';
import { ColDefinitionsType } from '@/components/grid/Types';
import { CollectionObject, CollectionFullObject } from '@server/types';

export interface CollectionDataProps {
  collectionName: string;
  collections: CollectionObject[];
  searchParams: SearchParamsType;
  setSearchParams: (params: SearchParamsType) => void;
}

const Search = (props: CollectionDataProps) => {
  // props
  const { collections, collectionName, searchParams, setSearchParams } = props;
  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

  const [tableLoading, setTableLoading] = useState<boolean>();

  // translations
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');
  // classes
  const classes = getQueryStyles();

  // UI functions
  const handleExpand = useCallback(
    (panel: string) => (event: ChangeEvent<{}>, expanded: boolean) => {
      const s = cloneObj(searchParams);
      const target = s.searchParams.find((sp: SearchSingleParams) => {
        return sp.field.name === panel;
      });

      if (target) {
        target.expanded = expanded;
        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  const handleSelect = useCallback(
    (panel: string) => (event: ChangeEvent<{}>) => {
      const s = cloneObj(searchParams) as SearchParamsType;
      const target = s.searchParams.find(sp => {
        return sp.field.name === panel;
      });
      if (target) {
        target.selected = !target.selected;

        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  // update search params
  const updateSearchParamCallback = useCallback(
    (updates: SearchSingleParams, index: number) => {
      if (
        JSON.stringify(updates) !==
        JSON.stringify(searchParams.searchParams[index].params)
      ) {
        const s = cloneObj(searchParams);
        // update the searchParams
        s.searchParams[index].params = updates;
        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  // generate random vectors
  const genRandomVectors = useCallback(() => {
    const s = cloneObj(searchParams) as SearchParamsType;
    s.searchParams.forEach((sp: SearchSingleParams) => {
      sp.data = generateVectorsByField(sp.field) as any;
    });

    setSearchParams({ ...s });
  }, [JSON.stringify(searchParams)]);

  // on vector input change, update the search params
  const onVectorInputChange = useCallback(
    (anns_field: string, value: string) => {
      const s = cloneObj(searchParams) as SearchParamsType;
      const target = s.searchParams.find((sp: SearchSingleParams) => {
        return sp.anns_field === anns_field;
      });

      if (value !== target!.data) {
        target!.data = value;
        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  // on filter change
  const onFilterChange = useCallback(
    (value: string) => {
      const s = cloneObj(searchParams) as SearchParamsType;
      s.globalParams.filter = value;
      setSearchParams({ ...s });

      return s;
    },
    [JSON.stringify(searchParams)]
  );

  // set search result
  const setSearchResult = useCallback(
    (props: { results: SearchResultView[]; latency: number }) => {
      const { results, latency } = props;
      const s = cloneObj(searchParams) as SearchParamsType;
      s.searchResult = results;
      s.searchLatency = latency;
      setSearchParams({ ...s });
    },
    [JSON.stringify(searchParams)]
  );

  // execute search
  const onSearchClicked = useCallback(async () => {
    const data = searchParams.searchParams
      .filter(s => s.selected)
      .map(s => {
        const formatter =
          VectorStrToObject[
            s.field.data_type as keyof typeof VectorStrToObject
          ];
        return {
          anns_field: s.field.name,
          data: formatter(s.data),
          params: s.params,
        };
      });

    const params: any = {
      output_fields: outputFields,
      limit: searchParams.globalParams.topK,
      data: data,
      filter: searchParams.globalParams.filter,
      consistency_level: searchParams.globalParams.consistency_level,
    };

    // reranker if exists
    if (searchParams.globalParams.rerank) {
      params.rerank = searchParams.globalParams.rerank;
    }

    setTableLoading(true);
    try {
      const res = await DataService.vectorSearchData(
        searchParams.collection.collection_name,
        params
      );

      setTableLoading(false);
      setSearchResult(res);
      // setLatency(res.latency);
    } catch (err) {
      setTableLoading(false);
    }
  }, [JSON.stringify(searchParams)]);

  const searchResultMemo = useSearchResult(
    (searchParams && (searchParams.searchResult as SearchResultView[])) || []
  );

  let primaryKeyField = 'id';

  const outputFields: string[] = useMemo(() => {
    if (!searchParams || !searchParams.collection) {
      return [];
    }

    const s = searchParams.collection.schema!;
    const _outputFields = s.scalarFields.map(f => f.name);

    if (s.enable_dynamic_field) {
      _outputFields.push(DYNAMIC_FIELD);
    }

    return _outputFields;
  }, [JSON.stringify(searchParams)]);

  const {
    pageSize,
    handlePageSize,
    setCurrentPage,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(searchResultMemo || []);

  // reset
  const onResetClicked = useCallback(() => {
    const s = cloneObj(searchParams) as SearchParamsType;
    s.searchResult = null;

    setSearchParams({ ...s });
    setCurrentPage(0);
  }, [JSON.stringify(searchParams), setCurrentPage]);

  const colDefinitions: ColDefinitionsType[] = useMemo(() => {
    const orderArray = [primaryKeyField, 'id', 'score', ...outputFields];

    return searchParams &&
      searchParams.searchResult &&
      searchParams.searchResult.length > 0
      ? Object.keys(searchParams.searchResult[0])
          .sort((a, b) => {
            const indexA = orderArray.indexOf(a);
            const indexB = orderArray.indexOf(b);
            return indexA - indexB;
          })
          .filter(item => {
            // if primary key field name is id, don't filter it
            const invalidItems = primaryKeyField === 'id' ? [] : ['id'];
            return !invalidItems.includes(item);
          })
          .map(key => ({
            id: key,
            align: 'left',
            disablePadding: false,
            label: key === DYNAMIC_FIELD ? searchTrans('dynamicFields') : key,
            needCopy: key !== 'score',
          }))
      : [];
  }, [JSON.stringify({ searchParams, outputFields })]);

  // methods
  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  // collection is not found or collection full object is not ready
  if (
    !searchParams ||
    (searchParams && searchParams.searchParams.length === 0)
  ) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }
  const hasVectorIndex = searchParams.collection.schema?.hasVectorIndex;
  const loaded = searchParams.collection.loaded;

  if (!hasVectorIndex || !loaded) {
    return (
      <div className={classes.root}>
        <EmptyCard
          wrapperClass={`page-empty-card`}
          icon={<Icons.load />}
          text={searchTrans('loadCollectionFirst')}
        />
      </div>
    );
  }

  // disable search button
  let disableSearch = false;
  let disableSearchTooltip = '';
  // has selected vector fields
  const selectedFields = searchParams.searchParams.filter(s => s.selected);

  if (selectedFields.length === 0) {
    disableSearch = true;
    disableSearchTooltip = searchTrans('noSelectedVectorField');
  }
  // has vector data to search
  const noDataInSelected = selectedFields.some(s => s.data === '');

  if (noDataInSelected) {
    disableSearch = true;
    disableSearchTooltip = searchTrans('noVectorToSearch');
  }

  return (
    <div className={classes.root}>
      {collection && (
        <div className={classes.inputArea}>
          <div className={classes.accordions}>
            {searchParams.searchParams.map((s, index: number) => {
              const field = s.field;
              return (
                <Accordion
                  key={`${collection.collection_name}-${field.name}`}
                  expanded={s.expanded}
                  onChange={handleExpand(field.name)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${field.name}-content`}
                    id={`${field.name}-header`}
                  >
                    <div className={classes.checkbox}>
                      {searchParams.searchParams.length > 1 && (
                        <Checkbox
                          size="small"
                          checked={s.selected}
                          onChange={handleSelect(field.name)}
                        />
                      )}
                      <div className="label">
                        <Typography
                          className={`field-name ${
                            s.data.length > 0 ? 'bold' : ''
                          }`}
                        >
                          {field.name}
                        </Typography>
                        <Typography className="vector-type">
                          {formatFieldType(field)}
                          <i>{field.index && field.index.metricType}</i>
                        </Typography>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetail}>
                    <VectorInputBox
                      searchParams={s}
                      onChange={onVectorInputChange}
                    />

                    <Typography className="text">
                      {searchTrans('thirdTip')}
                    </Typography>

                    <SearchParams
                      wrapperClass="paramsWrapper"
                      consistency_level={'Strong'}
                      handleConsistencyChange={(level: string) => {}}
                      indexType={field.index.indexType}
                      indexParams={field.index_params}
                      searchParamsForm={s.params}
                      handleFormChange={(
                        updates: { [key in string]: number | string }
                      ) => {
                        updateSearchParamCallback(updates as any, index);
                      }}
                      topK={searchParams.globalParams.topK}
                      setParamsDisabled={() => {
                        return false;
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>

          <div className={classes.searchControls}>
            <SearchGlobalParams
              searchParams={searchParams}
              searchGlobalParams={searchParams.globalParams}
              handleFormChange={(params: any) => {
                searchParams.globalParams = params;
                setSearchParams({ ...searchParams });
              }}
            />

            <CustomButton
              onClick={genRandomVectors}
              size="small"
              disabled={false}
            >
              {btnTrans('example')}
            </CustomButton>
          </div>

          <div className={classes.searchResults}>
            <section className={classes.toolbar}>
              <div className="left">
                <CustomInput
                  type="text"
                  textConfig={{
                    label: searchTrans('filterExpr'),
                    key: 'advFilter',
                    className: classes.filterInput,
                    onChange: onFilterChange,
                    value: searchParams.globalParams.filter,
                    disabled: false,
                    variant: 'filled',
                    required: false,
                    InputLabelProps: { shrink: true },
                    InputProps: {
                      endAdornment: (
                        <Filter
                          title={''}
                          showTitle={false}
                          fields={collection.schema.scalarFields}
                          filterDisabled={false}
                          onSubmit={(value: string) => {
                            onFilterChange(value);
                          }}
                          showTooltip={false}
                        />
                      ),
                    },
                    onKeyDown: (e: any) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onSearchClicked();
                      }
                    },
                  }}
                  checkValid={() => true}
                />
                <CustomButton
                  variant="contained"
                  size="small"
                  disabled={disableSearch}
                  tooltip={disableSearchTooltip}
                  tooltipPlacement="top"
                  onClick={onSearchClicked}
                >
                  {btnTrans('search')}
                </CustomButton>
              </div>
              <div className="right">
                <CustomButton
                  className="btn"
                  disabled={result.length === 0}
                  onClick={() => {
                    saveCsvAs(
                      searchParams.searchResult,
                      `search_result_${searchParams.collection.collection_name}`
                    );
                  }}
                  startIcon={<Icons.download classes={{ root: 'icon' }} />}
                >
                  {btnTrans('export')}
                </CustomButton>
                <CustomButton
                  className="btn"
                  onClick={onResetClicked}
                  startIcon={<Icons.clear classes={{ root: 'icon' }} />}
                >
                  {btnTrans('reset')}
                </CustomButton>
              </div>
            </section>

            {(searchParams.searchResult &&
              searchParams.searchResult.length > 0) ||
            tableLoading ? (
              <AttuGrid
                toolbarConfigs={[]}
                colDefinitions={colDefinitions}
                rows={result}
                rowCount={total}
                primaryKey="rank"
                page={currentPage}
                rowHeight={39}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                setRowsPerPage={handlePageSize}
                openCheckBox={false}
                isLoading={tableLoading}
                orderBy={orderBy}
                order={order}
                labelDisplayedRows={getLabelDisplayedRows(
                  `(${searchParams.searchLatency} ms)`
                )}
                handleSort={handleGridSort}
              />
            ) : (
              <EmptyCard
                wrapperClass={`page-empty-card`}
                icon={<Icons.search />}
                text={
                  searchParams.searchResult !== null
                    ? searchTrans('empty')
                    : searchTrans('startTip')
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
