import { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { Typography, Button, Card, CardContent } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import { useNavigationHook, useSearchResult, usePaginationHook } from '@/hooks';
import { dataContext } from '@/context';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { ColDefinitionsType } from '@/components/grid/Types';
import AttuGrid from '@/components/grid/Grid';
import EmptyCard from '@/components/cards/EmptyCard';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import SimpleMenu from '@/components/menu/SimpleMenu';
import { Option } from '@/components/customSelector/Types';
import Filter from '@/components/advancedSearch';
import { Field } from '@/components/advancedSearch/Types';
import { CollectionHttp, IndexHttp } from '@/http';
import {
  parseValue,
  parseLocationSearch,
  classifyFields,
  getDefaultIndexType,
  getEmbeddingType,
  getNonVectorFieldsForFilter,
  getVectorFieldOptions,
  cloneObj,
  generateVector,
} from '@/utils';
import {
  LOADING_STATE,
  DEFAULT_METRIC_VALUE_MAP,
  DYNAMIC_FIELD,
} from '@/consts';
import { getLabelDisplayedRows } from './Utils';
import SearchParams from './SearchParams';
import { getVectorSearchStyles } from './Styles';
import { CollectionData, DataTypeEnum } from '../collections/Types';
import { TOP_K_OPTIONS } from './Constants';
import { FieldOption, SearchResultView, VectorSearchParam } from './Types';

const VectorSearch = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SEARCH);
  const location = useLocation();
  const { database } = useContext(dataContext);

  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');

  const classes = getVectorSearchStyles();

  // data stored inside the component
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  // fields for advanced filter
  const [filterFields, setFilterFields] = useState<Field[]>([]);
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

  const searchResultMemo = useSearchResult(searchResult as any, classes);

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

  const collectionOptions: Option[] = useMemo(
    () =>
      collections.map(c => ({
        label: c._name,
        value: c._name,
      })),
    [collections]
  );

  const outputFields: string[] = useMemo(() => {
    const s = collections.find(c => c._name === selectedCollection);

    if (!s) {
      return [];
    }

    const fields = s._fields || [];

    // vector field can't be output fields
    const invalidTypes = ['BinaryVector', 'FloatVector'];
    const nonVectorFields = fields.filter(
      field => !invalidTypes.includes(field._fieldType)
    );

    const _outputFields = nonVectorFields.map(f => f._fieldName);
    if (s._enableDynamicField) {
      _outputFields.push(DYNAMIC_FIELD);
    }
    return _outputFields;
  }, [selectedCollection, collections]);

  const primaryKeyField = useMemo(() => {
    const selectedCollectionInfo = collections.find(
      c => c._name === selectedCollection
    );
    const fields = selectedCollectionInfo?._fields || [];
    return fields.find(f => f._isPrimaryKey)?._fieldName;
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
            needCopy: primaryKeyField === key,
          }))
      : [];
  }, [searchResult, primaryKeyField, orderArray]);

  const [selectedMetricType, setSelectedMetricType] = useState<string>('');

  const {
    indexType,
    indexParams,
    fieldType,
    embeddingType,
    selectedFieldDimension,
  } = useMemo(() => {
    if (selectedField !== '') {
      // field options must contain selected field, so selectedFieldInfo will never undefined
      const selectedFieldInfo = fieldOptions.find(
        f => f.value === selectedField
      );
      const index = selectedFieldInfo?.indexInfo;
      const embeddingType = getEmbeddingType(selectedFieldInfo!.fieldType);
      const metric =
        index?._metricType || DEFAULT_METRIC_VALUE_MAP[embeddingType];
      const indexParams = index?._indexParameterPairs || [];
      const dim = selectedFieldInfo?.dimension || 0;
      setSelectedMetricType(metric);

      return {
        metricType: metric,
        indexType: index?._indexType || getDefaultIndexType(embeddingType),
        indexParams,
        fieldType: DataTypeEnum[selectedFieldInfo?.fieldType!],
        embeddingType,
        selectedFieldDimension: dim,
      };
    }

    return {
      indexType: '',
      indexParams: [],
      fieldType: 0,
      embeddingType: DataTypeEnum.FloatVector,
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
  const fetchCollections = useCallback(async () => {
    const collections = await CollectionHttp.getCollections();
    setCollections(collections.filter(c => c._status === LOADING_STATE.LOADED));
  }, [database]);

  const fetchFieldsWithIndex = useCallback(
    async (collectionName: string, collections: CollectionData[]) => {
      const fields =
        collections.find(c => c._name === collectionName)?._fields || [];
      const indexes = await IndexHttp.getIndexInfo(collectionName);

      const { vectorFields, nonVectorFields } = classifyFields(fields);

      // only vector type fields can be select
      const fieldOptions = getVectorFieldOptions(vectorFields, indexes);
      setFieldOptions(fieldOptions);
      if (fieldOptions.length > 0) {
        // set first option value as default field value
        const [{ value: defaultFieldValue }] = fieldOptions;
        setSelectedField(defaultFieldValue as string);
      }

      // only non vector type fields can be advanced filter
      const filterFields = getNonVectorFieldsForFilter(nonVectorFields);
      setFilterFields(filterFields);
    },
    [collections]
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // clear selection if database is changed
  useEffect(() => {
    setSelectedCollection('');
  }, [database]);

  // get field options with index when selected collection changed
  useEffect(() => {
    if (selectedCollection !== '') {
      fetchFieldsWithIndex(selectedCollection, collections);
    }
  }, [selectedCollection, collections, fetchFieldsWithIndex]);

  // set default collection value if is from overview page
  useEffect(() => {
    if (location.search && collections.length > 0) {
      const { collectionName } = parseLocationSearch(location.search);
      // collection name validation
      const isNameValid = collections
        .map(c => c._name)
        .includes(collectionName);
      isNameValid && setSelectedCollection(collectionName);
    }
  }, [location, collections]);

  // icons
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;
  const ArrowIcon = icons.dropdown;

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
      vector_type: fieldType,
    };

    setTableLoading(true);
    try {
      const res = await CollectionHttp.vectorSearchData(
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
      <Card className={classes.form}>
        <CardContent className={classes.s1}>
          <Typography className="text">{searchTrans('secondTip')}</Typography>
          <CustomSelector
            options={collectionOptions}
            wrapperClass={classes.selector}
            variant="filled"
            label={searchTrans(
              collectionOptions.length === 0 ? 'noCollection' : 'collection'
            )}
            disabled={collectionOptions.length === 0}
            value={selectedCollection}
            onChange={(e: { target: { value: unknown } }) => {
              const collection = e.target.value;

              setSelectedCollection(collection as string);
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
              const field = e.target.value;
              setSelectedField(field as string);
            }}
          />
        </CardContent>

        <CardContent className={classes.s2}>
          <Typography className="text">
            {searchTrans('firstTip', {
              dimensionTip:
                selectedFieldDimension !== 0
                  ? `(dimension: ${selectedFieldDimension})`
                  : '',
            })}
            {selectedFieldDimension !== 0 ? (
              <Button
                className={classes.exampleBtn}
                variant="outlined"
                size="small"
                onClick={() => {
                  const dim =
                    fieldType === DataTypeEnum.BinaryVector
                      ? selectedFieldDimension / 8
                      : selectedFieldDimension;
                  fillWithExampleVector(dim);
                }}
              >
                {btnTrans('example')}
              </Button>
            ) : null}
          </Typography>

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
        </CardContent>

        <CardContent className={classes.s3}>
          <Typography className="text">{searchTrans('thirdTip')}</Typography>
          <SearchParams
            wrapperClass={classes.paramsWrapper}
            metricType={selectedMetricType}
            embeddingType={
              embeddingType as
                | DataTypeEnum.BinaryVector
                | DataTypeEnum.FloatVector
            }
            indexType={indexType}
            indexParams={indexParams!}
            searchParamsForm={searchParam}
            handleFormChange={setSearchParam}
            handleMetricTypeChange={setSelectedMetricType}
            topK={topK}
            setParamsDisabled={setParamDisabled}
          />
        </CardContent>
      </Card>

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
          </div>
          <div className="right">
            <CustomButton className="btn" onClick={handleReset}>
              <ResetIcon classes={{ root: 'icon' }} />
              {btnTrans('reset')}
            </CustomButton>
            <CustomButton
              variant="contained"
              disabled={searchDisabled}
              onClick={() => handleSearch(topK)}
            >
              {btnTrans('search')}
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
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            setRowsPerPage={handlePageSize}
            openCheckBox={false}
            isLoading={tableLoading}
            orderBy={orderBy}
            order={order}
            labelDisplayedRows={getLabelDisplayedRows(`(${latency} ms)`)}
            handleSort={handleGridSort}
            tableCellMaxWidth="100%"
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
