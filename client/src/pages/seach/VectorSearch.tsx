import {
  Chip,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
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
import { FieldOption, SearchResultView } from './Types';
import MilvusGrid from '../../components/grid/Grid';
import EmptyCard from '../../components/cards/EmptyCard';
import icons from '../../components/icons/Icons';
import { usePaginationHook } from '../../hooks/Pagination';
import CustomButton from '../../components/customButton/CustomButton';
import SimpleMenu from '../../components/menu/SimpleMenu';
import { TOP_K_OPTIONS } from './Constants';
import { Option } from '../../components/customSelector/Types';
import { CollectionHttp } from '../../http/Collection';
import { CollectionData, DataType } from '../collections/Types';
import { IndexHttp } from '../../http/Index';

const getStyles = makeStyles((theme: Theme) => ({
  form: {
    display: 'flex',

    '& .field': {
      padding: theme.spacing(2, 3, 3),
      backgroundColor: '#fff',
      borderRadius: theme.spacing(0.5),
      boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',

      '& .textarea': {
        border: `1px solid ${theme.palette.milvusGrey.main}`,
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(1),
        margin: theme.spacing(2, 0),
        minWidth: '364px',
      },

      // reset default style
      '& .textfield': {
        padding: 0,
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,

        '&::before': {
          borderBottom: 'none',
        },

        '&::after': {
          borderBottom: 'none',
        },
      },

      '& .multiline': {
        '& textarea': {
          overflow: 'auto',
          // change scrollbar style
          '&::-webkit-scrollbar': {
            width: '8px',
          },

          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f9f9f9',
          },

          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            backgroundColor: '#eee',
          },
        },
      },
    },

    '& .field-second': {
      flexGrow: 1,
      marginLeft: theme.spacing(1),
    },

    '& .text': {
      color: theme.palette.milvusGrey.dark,
      fontWeight: 500,
    },
  },
  selectors: {
    display: 'flex',
    justifyContent: 'space-between',

    '& .selector': {
      flexBasis: '45%',
      minWidth: '183px',
    },
  },
  paramsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    padding: theme.spacing(2, 0),

    '& .left': {
      display: 'flex',
      alignItems: 'center',

      '& .text': {
        color: theme.palette.milvusGrey.main,
      },

      '& .button': {
        marginLeft: theme.spacing(1),
        fontSize: '16px',
        lineHeight: '24px',
      },
    },
    '& .right': {
      '& .btn': {
        marginRight: theme.spacing(1),
      },
      '& .icon': {
        fontSize: '16px',
      },
    },
  },
  menuLabel: {
    minWidth: '108px',

    padding: theme.spacing(0, 1),
    marginLeft: theme.spacing(1),

    backgroundColor: '#fff',
    color: theme.palette.milvusGrey.dark,
  },
  menuItem: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.milvusGrey.dark,
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 0.5, 0, 1),
    marginLeft: theme.spacing(1),
  },
  chipLabel: {
    color: theme.palette.primary.main,
    paddingLeft: 0,
    paddingRight: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
  },
}));

const VectorSearch = () => {
  useNavigationHook(ALL_ROUTER_TYPES.SEARCH);
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');
  const classes = getStyles();

  // TODO: set real loading
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');
  const [searchParam, setSearchParam] = useState<{ [key in string]: number }>(
    {}
  );
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
    return fields.map(f => f._fieldName);
  }, [selectedCollection, collections]);

  const { metricType, indexType } = useMemo(() => {
    if (selectedField !== '') {
      // field options must contain selected field, so selectedFieldInfo will never undefined
      const selectedFieldInfo = fieldOptions.find(
        f => f.value === selectedField
      );

      const embeddingType =
        selectedFieldInfo!.fieldType === 'BinaryVector'
          ? EmbeddingTypeEnum.binary
          : EmbeddingTypeEnum.float;

      const metric =
        selectedFieldInfo!.metricType ||
        DEFAULT_METRIC_VALUE_MAP[embeddingType];

      return {
        metricType: metric,
        indexType: selectedFieldInfo!.indexType,
      };
    }

    return { metricType: '', indexType: '' };
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
      console.log('----- 226 indexes', indexes);

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
            metricType: index?._metricType || '',
            indexType: index?._indexType || 'FLAT',
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
  const handleSearch = () => {};
  const handleFilter = () => {};
  const handleClearFilter = () => {};
  const handleVectorChange = (value: string) => {
    setVectors(value);
  };

  return (
    <section className="page-wrapper">
      {/* form section */}
      <form className={classes.form}>
        {/* vector value, collection and field */}
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
            rows={2}
            placeholder={searchTrans('vectorPlaceholder')}
            onBlur={(e: React.ChangeEvent<{ value: unknown }>) => {
              handleVectorChange(e.target.value as string);
            }}
          />
          <div className={classes.selectors}>
            <CustomSelector
              options={collectionOptions}
              wrapperClass="selector"
              variant="filled"
              label={searchTrans('collection')}
              value={selectedCollection}
              onChange={(e: { target: { value: unknown } }) => {
                const collection = e.target.value;
                setSelectedCollection(collection as string);
                // everytime selected collection changed, reset field
                setSelectedField('');
              }}
            />
            <CustomSelector
              options={fieldOptions}
              readOnly={selectedCollection === ''}
              wrapperClass="selector"
              variant="filled"
              label={searchTrans('field')}
              value={selectedField}
              onChange={(e: { target: { value: unknown } }) => {
                const field = e.target.value;
                setSelectedField(field as string);
                console.log('selected field', field);
              }}
            />
          </div>
        </fieldset>
        {/* search params */}
        <fieldset className="field field-second">
          <Typography className="text">{searchTrans('secondTip')}</Typography>
          <SearchParams
            wrapperClass={classes.paramsWrapper}
            metricType={metricType!}
            embeddingType={EmbeddingTypeEnum.float}
            indexType={indexType}
            searchParamsForm={searchParam}
            handleFormChange={setSearchParam}
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
              callback: () => setTopK(item),
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
          colDefinitions={[]}
          rows={result}
          rowCount={total}
          primaryKey="_row"
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
