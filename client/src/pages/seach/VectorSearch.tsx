import { Chip, TextField, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SearchParams from './SearchParams';
import {
  DEFAULT_METRIC_VALUE_MAP,
  EmbeddingTypeEnum,
} from '../../consts/Milvus';
import { FieldOption, SearchResultView, VectorSearchParam } from './Types';
import MilvusGrid from '../../components/grid/Grid';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { usePaginationHook } from '../../hooks/Pagination';
import CustomButton from '../../components/customButton/CustomButton';
import SimpleMenu from '../../components/menu/SimpleMenu';
import { TOP_K_OPTIONS } from './Constants';
import { Option } from '../../components/customSelector/Types';
import { CollectionHttp } from '../../http/Collection';
import { CollectionData, DataType, DataTypeEnum } from '../collections/Types';
import { IndexHttp } from '../../http/Index';
import { getVectorSearchStyles } from './Styles';
import { parseValue } from '../../utils/Insert';
import { transferSearchResult } from '../../utils/search';
import { ColDefinitionsType } from '../../components/grid/Types';

const VectorSearch = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SEARCH);
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');
  const classes = getVectorSearchStyles();

  // data stored inside the component
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  // search params form
  const [searchParam, setSearchParam] = useState<{ [key in string]: number }>(
    {}
  );
  // search params disable state
  const [paramDisabled, setParamDisabled] = useState<boolean>(true);
  const [searchResult, setSearchResult] = useState<SearchResultView[]>([]);
  // default topK is 100
  const [topK, setTopK] = useState<number>(100);
  const [vectors, setVectors] = useState<string>('');

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
  } = usePaginationHook(searchResult);

  const collectionOptions: Option[] = useMemo(
    () =>
      collections.map(c => ({
        label: c._name,
        value: c._name,
      })),
    [collections]
  );

  const outputFields: string[] = useMemo(() => {
    const fields =
      collections.find(c => c._name === selectedCollection)?._fields || [];
    // vector field can't be output fields
    const invalidTypes = ['BinaryVector', 'FloatVector'];
    const nonVectorFields = fields.filter(
      field => !invalidTypes.includes(field._fieldType)
    );
    return nonVectorFields.map(f => f._fieldName);
  }, [selectedCollection, collections]);

  const colDefinitions: ColDefinitionsType[] = useMemo(() => {
    // filter id and score
    return searchResult.length > 0
      ? Object.keys(searchResult[0])
          .filter(item => item !== 'id' && item !== 'score')
          .map(key => ({
            id: key,
            align: 'left',
            disablePadding: false,
            label: key,
          }))
      : [];
  }, [searchResult]);

  const { metricType, indexType, indexParams, fieldType } = useMemo(() => {
    if (selectedField !== '') {
      // field options must contain selected field, so selectedFieldInfo will never undefined
      const selectedFieldInfo = fieldOptions.find(
        f => f.value === selectedField
      );

      const index = selectedFieldInfo?.indexInfo;

      const embeddingType =
        selectedFieldInfo!.fieldType === 'BinaryVector'
          ? EmbeddingTypeEnum.binary
          : EmbeddingTypeEnum.float;

      const metric =
        index!._metricType || DEFAULT_METRIC_VALUE_MAP[embeddingType];

      const indexParams = index?._indexParameterPairs || [];

      return {
        metricType: metric,
        indexType: index!._indexType,
        indexParams,
        fieldType: DataTypeEnum[selectedFieldInfo?.fieldType!],
      };
    }

    return {
      metricType: '',
      indexType: '',
      indexParams: [],
      fieldType: 0,
    };
  }, [selectedField, fieldOptions]);

  // fetch data
  const fetchCollections = useCallback(async () => {
    const collections = await CollectionHttp.getCollections();
    setCollections(collections);
  }, []);

  const fetchFieldsWithIndex = useCallback(
    async (collectionName: string, collections: CollectionData[]) => {
      const fields =
        collections.find(c => c._name === collectionName)?._fields || [];
      const vectorTypes: DataType[] = ['BinaryVector', 'FloatVector'];
      const indexes = await IndexHttp.getIndexInfo(collectionName);

      const fieldOptions = fields
        // only vector type field can be select
        .filter(field => vectorTypes.includes(field._fieldType))
        // use FLAT as default index type
        .map(f => {
          const index = indexes.find(i => i._fieldName === f._fieldName);
          return {
            label: `${f._fieldName} (${index?._indexType || 'FLAT'})`,
            value: f._fieldName,
            fieldType: f._fieldType,
            indexInfo: index || null,
          };
        });
      setFieldOptions(fieldOptions);
    },
    []
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // get field options with index when selected collection changed
  useEffect(() => {
    if (selectedCollection !== '') {
      fetchFieldsWithIndex(selectedCollection, collections);
    }
  }, [selectedCollection, collections, fetchFieldsWithIndex]);

  // icons
  const VectorSearchIcon = icons.vectorSearch;
  const ResetIcon = icons.refresh;
  const ArrowIcon = icons.dropdown;
  const FilterIcon = icons.filter;
  const ClearIcon = icons.clear;

  // methods
  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };
  const handleReset = () => {};
  const handleSearch = async () => {
    const searhParamPairs = [
      // dynamic search params
      {
        key: 'params',
        value: JSON.stringify(searchParam),
      },
      {
        key: 'anns_field',
        value: selectedField,
      },
      {
        key: 'topk',
        value: topK,
      },
      {
        key: 'metric_type',
        value: metricType,
      },
    ];

    const params: VectorSearchParam = {
      output_fields: outputFields,
      expr: '',
      search_params: searhParamPairs,
      vectors: [parseValue(vectors)],
      vector_type: fieldType,
    };

    setTableLoading(true);
    const res = await CollectionHttp.vectorSearchData(
      selectedCollection,
      params
    );
    setTableLoading(false);

    const result = transferSearchResult(res.results);
    setSearchResult(result);
  };
  const handleFilter = () => {};
  const handleClearFilter = () => {};
  const handleVectorChange = (value: string) => {
    setVectors(value);
  };

  return (
    <section className="page-wrapper">
      {/* form section */}
      <form className={classes.form}>
        {/* vector value textarea */}
        <fieldset className="field">
          <Typography className="text">{searchTrans('firstTip')}</Typography>
          <TextField
            className="textarea"
            InputProps={{
              classes: {
                root: 'textfield',
                multiline: 'multiline',
              },
            }}
            multiline
            rows={5}
            placeholder={searchTrans('vectorPlaceholder')}
            onBlur={(e: React.ChangeEvent<{ value: unknown }>) => {
              handleVectorChange(e.target.value as string);
            }}
          />
        </fieldset>
        {/* collection and field selectors */}
        <fieldset className="field field-second">
          <Typography className="text">{searchTrans('secondTip')}</Typography>
          <CustomSelector
            options={collectionOptions}
            wrapperClass={classes.selector}
            variant="filled"
            label={searchTrans('collection')}
            value={selectedCollection}
            onChange={(e: { target: { value: unknown } }) => {
              const collection = e.target.value;
              setSelectedCollection(collection as string);
              // every time selected collection changed, reset field
              setSelectedField('');
            }}
          />
          <CustomSelector
            options={fieldOptions}
            readOnly={selectedCollection === ''}
            wrapperClass={classes.selector}
            variant="filled"
            label={searchTrans('field')}
            value={selectedField}
            onChange={(e: { target: { value: unknown } }) => {
              const field = e.target.value;
              setSelectedField(field as string);
            }}
          />
        </fieldset>
        {/* search params selectors */}
        <fieldset className="field">
          <Typography className="text">{searchTrans('thirdTip')}</Typography>
          <SearchParams
            wrapperClass={classes.paramsWrapper}
            metricType={metricType!}
            embeddingType={EmbeddingTypeEnum.float}
            indexType={indexType}
            indexParams={indexParams!}
            searchParamsForm={searchParam}
            handleFormChange={setSearchParam}
            topK={topK}
            setParamsDisabled={setParamDisabled}
          />
        </fieldset>
      </form>

      {/**
       * search toolbar section
       * including topK selector, advanced filter, search and reset btn
       */}
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
                // TODO: check search validation before search
                // handleSearch();
              },
              wrapperClass: classes.menuItem,
            }))}
            buttonProps={{
              className: classes.menuLabel,
              endIcon: <ArrowIcon />,
            }}
            menuItemWidth="108px"
          />
          <CustomButton
            className="button"
            disabled={selectedField === '' || selectedCollection === ''}
            onClick={handleFilter}
          >
            <FilterIcon />
            {searchTrans('filter')}
          </CustomButton>
          {/* advanced filter number chip */}
          <Chip
            variant="outlined"
            size="small"
            // TODO: need to replace mock data
            label={'3'}
            classes={{ root: classes.chip, label: classes.chipLabel }}
            deleteIcon={<ClearIcon />}
            onDelete={handleClearFilter}
          />
        </div>
        <div className="right">
          <CustomButton className="btn" onClick={handleReset}>
            <ResetIcon classes={{ root: 'icon' }} />
            {btnTrans('reset')}
          </CustomButton>
          <CustomButton variant="contained" onClick={handleSearch}>
            {btnTrans('search')}
          </CustomButton>
        </div>
      </section>

      {/* search result table section */}
      {searchResult.length > 0 || tableLoading ? (
        <MilvusGrid
          toolbarConfigs={[]}
          colDefinitions={colDefinitions}
          rows={result}
          rowCount={total}
          primaryKey="rank"
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          openCheckBox={false}
          isLoading={tableLoading}
        />
      ) : (
        <EmptyCard
          wrapperClass={`page-empty-card`}
          icon={<VectorSearchIcon />}
          text={searchTrans('empty')}
        />
      )}
    </section>
  );
};

export default VectorSearch;
