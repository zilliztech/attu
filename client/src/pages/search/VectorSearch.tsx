import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Typography, Button, Card, CardContent } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { useNavigationHook, useSearchResult, usePaginationHook } from '@/hooks';
import { dataContext } from '@/context';
import { saveCsvAs } from '@/utils';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ColDefinitionsType } from '@/components/grid/Types';
import AttuGrid from '@/components/grid/Grid';
import EmptyCard from '@/components/cards/EmptyCard';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import SimpleMenu from '@/components/menu/SimpleMenu';
import { Option } from '@/components/customSelector/Types';
import Filter from '@/components/advancedSearch';
import { DataService } from '@/http';
import {
  parseValue,
  parseLocationSearch,
  getVectorFieldOptions,
  cloneObj,
  generateVector,
  formatNumber,
} from '@/utils';
import { LOADING_STATE, DYNAMIC_FIELD, DataTypeEnum } from '@/consts';
import { getLabelDisplayedRows } from './Utils';
import SearchParams from './SearchParams';
import { getVectorSearchStyles } from './Styles';
import { TOP_K_OPTIONS } from './Constants';
import { FieldOption, SearchResultView, VectorSearchParam } from './Types';
import { FieldObject, CollectionFullObject } from '@server/types';

const VectorSearch = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SEARCH);
  const location = useLocation();
  const { database, collections } = useContext(dataContext);

  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');

  const classes = getVectorSearchStyles();

  // data stored inside the component
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  // fields for advanced filter
  const [filterFields, setFilterFields] = useState<FieldObject[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');

  // search params form
  const [searchParam, setSearchParam] = useState<{ [key in string]: number }>(
    {}
  );
  // search params disable state
  const [paramDisabled, setParamDisabled] = useState<boolean>(true);
  // use null as init value before search, empty array means no results
  const [searchResult, setSearchResult] = useState<SearchResultView[] | null>(
    null
  );
  // default topK is 100
  const [topK, setTopK] = useState<number>(100);
  const [expression, setExpression] = useState<string>('');
  const [vectors, setVectors] = useState<string>('');

  // latency
  const [latency, setLatency] = useState<number>(0);

  const searchResultMemo = useSearchResult(searchResult as any);

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(searchResultMemo || []);

  const outputFields: string[] = useMemo(() => {
    const s = collections.find(
      c => c.collection_name === selectedCollection
    ) as CollectionFullObject;

    if (!s) {
      return [];
    }

    const fields = s.schema.fields || [];

    // vector field can't be output fields
    const invalidTypes = ['BinaryVector', 'FloatVector'];
    const nonVectorFields = fields.filter(
      field => !invalidTypes.includes(field.data_type)
    );

    const _outputFields = nonVectorFields.map(f => f.name);
    if (s.schema?.enable_dynamic_field) {
      _outputFields.push(DYNAMIC_FIELD);
    }
    return _outputFields;
  }, [selectedCollection, collections]);

  const primaryKeyField = useMemo(() => {
    const selectedCollectionInfo = collections.find(
      c => c.collection_name === selectedCollection
    );
    const fields = selectedCollectionInfo?.schema?.fields || [];
    return fields.find(f => f.is_primary_key)?.name;
  }, [selectedCollection, collections]);

  const orderArray = [primaryKeyField, 'id', 'score', ...outputFields];

  const colDefinitions: ColDefinitionsType[] = useMemo(() => {
    /**
     * id represents primary key, score represents distance
     * since we transfer score to distance in the view, and original field which is primary key has already in the table
     * we filter 'id' and 'score' to avoid redundant data
     */
    return searchResult && searchResult.length > 0
      ? Object.keys(searchResult[0])
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
  }, [searchResult, primaryKeyField, orderArray]);

  const [selectedMetricType, setSelectedMetricType] = useState<string>('');
  const [selectedConsistencyLevel, setSelectedConsistencyLevel] =
    useState<string>('');

  const { indexType, indexParams, fieldType, selectedFieldDimension } =
    useMemo(() => {
      if (selectedField !== '') {
        // field options must contain selected field, so selectedFieldInfo will never undefined
        const field = fieldOptions.find(f => f.value === selectedField)?.field;
        const metric = field?.index.metricType || '';
        setSelectedMetricType(metric);

        return {
          metricType: metric,
          indexType: field?.index.indexType,
          indexParams: field?.index.indexParameterPairs || [],
          fieldType: field?.dataType,
          selectedFieldDimension: field?.dimension || 0,
        };
      }

      return {
        indexType: '',
        indexParams: [],
        fieldType: DataTypeEnum.FloatVector,
        selectedFieldDimension: 0,
      };
    }, [selectedField, fieldOptions]);

  /**
   * vector value validation
   * @return whether is valid
   */
  const vectorValueValid = useMemo(() => {
    // if user hasn't input value or not select field, don't trigger validation check
    if (vectors === '' || selectedFieldDimension === 0) {
      return true;
    }
    const dim =
      fieldType === DataTypeEnum.BinaryVector
        ? selectedFieldDimension / 8
        : selectedFieldDimension;

    const value = parseValue(vectors);
    const isArray = Array.isArray(value);
    return isArray && value.length === dim;
  }, [vectors, selectedFieldDimension, fieldType]);

  const searchDisabled = useMemo(() => {
    /**
     * before search, user must:
     * 1. enter vector value, it should be an array and length should be equal to selected field dimension
     * 2. choose collection and field
     * 3. set extra search params
     */
    const isInvalid =
      vectors === '' ||
      selectedCollection === '' ||
      selectedField === '' ||
      paramDisabled ||
      !vectorValueValid;
    return isInvalid;
  }, [
    paramDisabled,
    selectedField,
    selectedCollection,
    vectors,
    vectorValueValid,
  ]);

  // fetch data
  const loadedCollections = collections.filter(
    c => c.status === LOADING_STATE.LOADED
  ) as CollectionFullObject[];
  // sort by rowCounts
  loadedCollections.sort((a, b) => b.rowCount - a.rowCount);

  const collectionOptions: Option[] = useMemo(
    () =>
      loadedCollections.map(c => ({
        label: `${c.collection_name}(${formatNumber(c.rowCount)})`,
        value: c.collection_name,
      })),
    [loadedCollections]
  );

  const fetchFieldsWithIndex = useCallback(
    async (collectionName: string, collections: CollectionFullObject[]) => {
      const col = collections.find(c => c.collection_name === collectionName);

      // only vector type fields can be select
      const fieldOptions = getVectorFieldOptions(col?.schema.vectorFields!);
      setFieldOptions(fieldOptions);
      if (fieldOptions.length > 0) {
        // set first option value as default field value
        const [{ value: defaultFieldValue }] = fieldOptions;
        setSelectedField(defaultFieldValue as string);
      }

      setFilterFields(col?.schema.scalarFields!);
    },
    [collections]
  );

  // clear selection if database is changed
  useEffect(() => {
    setSelectedCollection('');
    setVectors('');
    setSearchResult(null);
  }, [database]);

  // get field options with index when selected collection changed
  useEffect(() => {
    if (selectedCollection !== '') {
      fetchFieldsWithIndex(
        selectedCollection,
        collections as CollectionFullObject[]
      );
    }
    const level = collections.find(c => c.collection_name == selectedCollection)
      ?.consistency_level!;
    setSelectedConsistencyLevel(level);
  }, [selectedCollection, collections, fetchFieldsWithIndex]);

  // set default collection value if is from overview page
  useEffect(() => {
    if (location.search && collections.length > 0) {
      const { collectionName } = parseLocationSearch(location.search);
      // collection name validation
      const isNameValid = collections
        .map(c => c.collection_name)
        .includes(collectionName);
      isNameValid && setSelectedCollection(collectionName);
    }
  }, [location, collections]);

  // icons
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;
  const ArrowIcon = icons.dropdown;
  const ExportIcon = icons.download;

  // methods
  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };
  const handleReset = () => {
    /**
     * reset search includes:
     * 1. reset vectors
     * 2. reset selected collection and field
     * 3. reset search params
     * 4. reset advanced filter expression
     * 5. clear search result
     */
    setVectors('');
    setSelectedField('');
    setSelectedCollection('');
    setSearchResult(null);
    setFilterFields([]);
    setExpression('');
  };

  const handleSearch = async (topK: number, expr = expression) => {
    const clonedSearchParams = cloneObj(searchParam);
    delete clonedSearchParams.round_decimal;
    const searchParamPairs = {
      params: JSON.stringify(clonedSearchParams),
      anns_field: selectedField,
      topk: topK,
      metric_type: selectedMetricType,
      round_decimal: searchParam.round_decimal,
    };

    const params: VectorSearchParam = {
      output_fields: outputFields,
      expr,
      search_params: searchParamPairs,
      vectors: [parseValue(vectors)],
      vector_type: fieldType as DataTypeEnum,
      consistency_level:
        selectedConsistencyLevel ||
        collections.find(c => c.collection_name == selectedCollection)
          ?.consistency_level!,
    };

    setTableLoading(true);
    try {
      const res = await DataService.vectorSearchData(
        selectedCollection,
        params
      );
      setTableLoading(false);
      setSearchResult(res.results);
      setLatency(res.latency);
    } catch (err) {
      setTableLoading(false);
    }
  };
  const handleAdvancedFilterChange = (expression: string) => {
    setExpression(expression);
    if (!searchDisabled) {
      handleSearch(topK, expression);
    }
  };

  const handleVectorChange = (value: string) => {
    setVectors(value);
  };

  const fillWithExampleVector = (selectedFieldDimension: number) => {
    const v = generateVector(selectedFieldDimension);
    setVectors(`[${v}]`);
  };

  return (
    <section className={`page-wrapper ${classes.pageContainer}`}>
      <section className={classes.form}>
        <CardContent className={classes.s1}>
          <div className="wrapper">
            <CustomSelector
              options={collectionOptions}
              wrapperClass={classes.selector}
              variant="filled"
              label={searchTrans('collection')}
              disabled={collectionOptions.length === 0}
              value={selectedCollection}
              onChange={(e: { target: { value: unknown } }) => {
                const collection = e.target.value as string;

                setSelectedCollection(collection);
                // every time selected collection changed, reset field
                setSelectedField('');
                setSearchResult([]);
              }}
            />
            <CustomSelector
              options={fieldOptions}
              // readOnly can't avoid all events, so we use disabled instead
              disabled={selectedCollection === ''}
              wrapperClass={classes.selector}
              variant="filled"
              label={searchTrans('field')}
              value={selectedField}
              onChange={(e: { target: { value: unknown } }) => {
                const field = e.target.value as string;
                setSelectedField(field);
              }}
            />
          </div>
        </CardContent>

        <CardContent className={classes.s2}>
          <textarea
            className="textarea"
            placeholder={searchTrans('vectorPlaceholder')}
            value={vectors}
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
              handleVectorChange(e.target.value as string);
            }}
          />
          {/* validation */}
          {!vectorValueValid && (
            <Typography variant="caption" className={classes.error}>
              {searchTrans('vectorValueWarning', {
                dimension:
                  fieldType === DataTypeEnum.BinaryVector
                    ? selectedFieldDimension / 8
                    : selectedFieldDimension,
              })}
            </Typography>
          )}
          {selectedFieldDimension !== 0 ? (
            <CustomButton
              className={classes.exampleBtn}
              onClick={() => {
                const dim =
                  fieldType === DataTypeEnum.BinaryVector
                    ? selectedFieldDimension / 8
                    : selectedFieldDimension;
                fillWithExampleVector(dim);
              }}
            >
              {btnTrans('example')}
            </CustomButton>
          ) : null}
          <CustomButton
            variant="contained"
            disabled={searchDisabled}
            onClick={() => handleSearch(topK)}
          >
            {btnTrans('search')}
          </CustomButton>
        </CardContent>

        <CardContent className={classes.s3}>
          <Typography className="text">
            {searchTrans('thirdTip', {
              metricType: `${
                selectedMetricType ? `(${selectedMetricType})` : ''
              }`,
            })}
          </Typography>
          <SearchParams
            wrapperClass={classes.paramsWrapper}
            consistency_level={selectedConsistencyLevel}
            handleConsistencyChange={(level: string) => {
              setSelectedConsistencyLevel(level);
            }}
            indexType={indexType!}
            indexParams={indexParams!}
            searchParamsForm={searchParam}
            handleFormChange={setSearchParam}
            topK={topK}
            setParamsDisabled={setParamDisabled}
          />
        </CardContent>
      </section>

      <section className={classes.resultsWrapper}>
        <section className={classes.toolbar}>
          <div className="left">
            <Typography variant="h5" className="text">
              {`${searchTrans('result')}: `}
            </Typography>
            {/* topK selector */}
            <SimpleMenu
              label={searchTrans('topK', { number: topK })}
              menuItems={TOP_K_OPTIONS.map(item => ({
                label: item.toString(),
                callback: () => {
                  setTopK(item);
                  if (!searchDisabled) {
                    handleSearch(item);
                  }
                },
                wrapperClass: classes.menuItem,
              }))}
              buttonProps={{
                className: classes.menuLabel,
                endIcon: <ArrowIcon />,
              }}
              menuItemWidth="108px"
            />

            <Filter
              title="Advanced Filter"
              fields={filterFields}
              filterDisabled={selectedField === '' || selectedCollection === ''}
              onSubmit={handleAdvancedFilterChange}
            />
            <CustomButton
              className="btn"
              disabled={result.length === 0}
              onClick={() => {
                saveCsvAs(searchResult, `search_result_${selectedCollection}`);
              }}
              startIcon={<ExportIcon classes={{ root: 'icon' }}></ExportIcon>}
            >
              {btnTrans('export')}
            </CustomButton>
          </div>
          <div className="right">
            <CustomButton
              className="btn"
              onClick={handleReset}
              startIcon={<ResetIcon classes={{ root: 'icon' }} />}
            >
              {btnTrans('reset')}
            </CustomButton>
          </div>
        </section>

        {/* search result table section */}
        {(searchResult && searchResult.length > 0) || tableLoading ? (
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
            labelDisplayedRows={getLabelDisplayedRows(`(${latency} ms)`)}
            handleSort={handleGridSort}
          />
        ) : (
          <EmptyCard
            wrapperClass={`page-empty-card`}
            icon={<VectorSearchIcon />}
            text={
              searchResult !== null
                ? searchTrans('empty')
                : searchTrans('startTip')
            }
          />
        )}
      </section>
    </section>
  );
};

export default VectorSearch;
