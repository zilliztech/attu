import { useState, useMemo, ChangeEvent, useCallback, useContext } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataService, CollectionService } from '@/http';
import { rootContext } from '@/context';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomInput from '@/components/customInput/CustomInput';
import {
  formatFieldType,
  cloneObj,
  generateVectorsByField,
  saveCsvAs,
  buildSearchParams,
  buildSearchCode,
  getColumnWidth,
} from '@/utils';
import SearchParams from '../../../search/SearchParams';
import DataExplorer, { formatMilvusData } from './DataExplorer';
import { GraphData, GraphNode } from '../../types';
import {
  SearchParams as SearchParamsType,
  SearchSingleParams,
  SearchResultView,
} from '../../types';
import { DYNAMIC_FIELD } from '@/consts';
import { ColDefinitionsType } from '@/components/grid/Types';
import { CollectionObject, CollectionFullObject } from '@server/types';
import CodeDialog from '@/pages/dialogs/CodeDialog';
import CollectionColHeader from '../CollectionColHeader';

export interface CollectionDataProps {
  collectionName: string;
  collections: CollectionObject[];
  searchParams: SearchParamsType;
  setSearchParams: (params: SearchParamsType) => void;
}

const emptyExplorerData: GraphData = {
  nodes: [],
  links: [],
};

const Search = (props: CollectionDataProps) => {
  // props
  const { collections, collectionName, searchParams, setSearchParams } = props;
  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

  // context
  const { setDialog } = useContext(rootContext);

  // UI states
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [highlightField, setHighlightField] = useState<string>('');
  const [explorerOpen, setExplorerOpen] = useState<boolean>(false);

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
      const newGraphData = formatMilvusData(
        emptyExplorerData,
        { id: 'root' },
        s.searchResult
      );
      s.graphData = newGraphData;

      setSearchParams({ ...s });
    },
    [JSON.stringify(searchParams)]
  );

  // execute search
  const onSearchClicked = useCallback(async () => {
    const params = buildSearchParams(searchParams);
    setExplorerOpen(false);

    setTableLoading(true);
    try {
      const res = await DataService.vectorSearchData(
        searchParams.collection.collection_name,
        params
      );

      setTableLoading(false);
      setSearchResult(res);
    } catch (err) {
      setTableLoading(false);
    }
  }, [JSON.stringify(searchParams)]);

  // execute explore
  const onExploreClicked = () => {
    setExplorerOpen(explorerOpen => !explorerOpen);
  };

  const onNodeClicked = useCallback(
    async (node: GraphNode) => {
      if (node.id === 'root') {
        return;
      }
      setExplorerOpen(true);
      setTableLoading(false);

      const s = cloneObj(searchParams);
      const params = cloneObj(buildSearchParams(searchParams));

      try {
        const query = await CollectionService.queryData(collectionName, {
          expr: 'id == ' + node.id,
          output_fields: ['*'],
        });

        // replace the vector data
        params.data[0].data = query.data[0][params.data[0].anns_field];

        const search = await DataService.vectorSearchData(
          s.collection.collection_name,
          params
        );

        const newGraphData = formatMilvusData(
          s.graphData,
          { id: node.id, data: params.data[0].data },
          search.results
        );

        s.graphData = newGraphData;
        setSearchParams({ ...s });
      } catch (err) {
        console.log('err', err);
      }
    },
    [JSON.stringify(searchParams)]
  );

  const searchResultMemo = useSearchResult(
    (searchParams && (searchParams.searchResult as SearchResultView[])) || []
  );

  let primaryKeyField = 'id';

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

  const onExplorerResetClicked = useCallback(() => {
    onSearchClicked();
    onExploreClicked();
  }, [onSearchClicked, onSearchClicked]);

  const colDefinitions: ColDefinitionsType[] = useMemo(() => {
    if (!searchParams || !searchParams.collection) {
      return [];
    }
    // collection fields, combine static and dynamic fields
    const orderArray = [
      primaryKeyField,
      'id',
      'score',
      ...searchParams.globalParams.output_fields,
    ];

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
            return !invalidItems.includes(item) && orderArray.includes(item);
          })
          .map(key => {
            return {
              id: key,
              align: 'left',
              disablePadding: false,
              label: key === DYNAMIC_FIELD ? searchTrans('dynamicFields') : key,
              needCopy: key !== 'score',
              headerFormatter: v => {
                return <CollectionColHeader def={v} collection={collection} />;
              },
              getStyle: d => {
                const field = collection.schema.fields.find(
                  f => f.name === key
                );
                if (!d || !field) {
                  return {};
                }
                return {
                  minWidth: getColumnWidth(field),
                };
              },
            };
          })
      : [];
  }, [
    JSON.stringify({
      searchParams,
    }),
  ]);

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
                  className={`${classes.accordion} ${
                    highlightField === field.name && 'highlight'
                  }`}
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
                      collection={collection}
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
              onSlideChange={(field: string) => {
                setHighlightField(field);
              }}
              onSlideChangeCommitted={() => {
                setHighlightField('');
              }}
              searchParams={searchParams}
              handleFormChange={(params: any) => {
                searchParams.globalParams = params;
                setSearchParams({ ...searchParams });
              }}
            />

            <CustomButton
              onClick={genRandomVectors}
              size="small"
              disabled={false}
              className={classes.genBtn}
            >
              {btnTrans('example')}
            </CustomButton>

            <CustomButton
              variant="contained"
              size="small"
              className={classes.genBtn}
              disabled={disableSearch}
              tooltip={disableSearchTooltip}
              tooltipPlacement="top"
              onClick={onSearchClicked}
            >
              {btnTrans('searchMulti', {
                number:
                  searchParams.collection.schema.vectorFields.length > 1
                    ? `(${selectedFields.length})`
                    : '',
              })}
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
                    className: 'textarea',
                    onChange: onFilterChange,
                    value: searchParams.globalParams.filter,
                    disabled: explorerOpen,
                    variant: 'filled',
                    required: false,
                    InputLabelProps: { shrink: true },
                    InputProps: {
                      endAdornment: (
                        <Filter
                          title={''}
                          showTitle={false}
                          fields={collection.schema.scalarFields}
                          filterDisabled={explorerOpen}
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
              </div>
              <div className="right">
                <CustomButton
                  onClick={() => {
                    onExploreClicked();
                  }}
                  size="small"
                  disabled={
                    !searchParams.searchResult ||
                    searchParams.searchResult!.length === 0
                  }
                  className={classes.btn}
                  startIcon={<Icons.magic classes={{ root: 'icon' }} />}
                >
                  {btnTrans('explore')}
                </CustomButton>
                <CustomButton
                  className={classes.btn}
                  disabled={disableSearch}
                  onClick={() => {
                    // open code dialog
                    setDialog({
                      open: true,
                      type: 'custom',
                      params: {
                        component: (
                          <CodeDialog
                            data={buildSearchCode(searchParams, collection)}
                          />
                        ),
                      },
                    });
                  }}
                  startIcon={<Icons.code classes={{ root: 'icon' }} />}
                >
                  {btnTrans('Code')}
                </CustomButton>

                <CustomButton
                  className={classes.btn}
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
                  className={classes.btn}
                  onClick={
                    explorerOpen ? onExplorerResetClicked : onResetClicked
                  }
                  startIcon={<Icons.clear classes={{ root: 'icon' }} />}
                >
                  {btnTrans('reset')}
                </CustomButton>
              </div>
            </section>

            {explorerOpen ? (
              <div className={classes.explorer}>
                <DataExplorer
                  data={searchParams.graphData}
                  onNodeClick={onNodeClicked}
                />
                <CustomButton
                  onClick={() => {
                    setExplorerOpen(false);
                  }}
                  size="small"
                  startIcon={<Icons.clear classes={{ root: 'icon' }} />}
                  className={classes.closeBtn}
                  variant="contained"
                >
                  {btnTrans('close')}
                </CustomButton>
              </div>
            ) : (searchParams.searchResult &&
                searchParams.searchResult.length > 0) ||
              tableLoading ? (
              <AttuGrid
                toolbarConfigs={[]}
                colDefinitions={colDefinitions}
                rows={result}
                rowCount={total}
                primaryKey="rank"
                page={currentPage}
                tableHeaderHeight={46}
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
